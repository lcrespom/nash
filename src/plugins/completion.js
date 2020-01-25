const path = require('path')
const os = require('os')
const glob = require('fast-glob')
const chalk = require('chalk')

const {
    hideCursor, showCursor, computeTableLayout, tableMenu
} = require('node-terminal-menu')

const { bindKey } = require('../key-bindings')
const {
    startsWithCaseInsensitive, cutLastChars, commonInitialChars
} = require('../utils')
const {
    parseBash, traverseAST, NodeType, builtins
} = require('../parser')
const {
    getCursorPosition, setCursorPosition
} = require('../prompt')
const { getOption } = require('../startup')


//------------------------- AST Searching -------------------------

function insideLoc(loc, pos) {
    return loc.start.char <= pos && pos <= loc.end.char
}

function getNodeInPosition(ast, pos) {
    let node = null
    traverseAST(ast, n => {
        if (insideLoc(n.loc, pos)) {
            node = n
        }
    })
    return node
}

function getLocAndType(node, pos) {
    if (!node)
        return [null, NodeType.unknown]
    if (node.type != 'Command')
        return [node.loc, NodeType.unknown]
    if (insideLoc(node.name.loc, pos))
        return [node.name.loc, NodeType.command]
    if (!node.suffix)
        return [node.loc, NodeType.unknown]
    for (let s of node.suffix) {
        if (insideLoc(s.loc, pos)) {
            if (s.text[0] == '$')
                return [s.loc, NodeType.environment]
            else if (s.text[0] == '-')
                return [s.loc, NodeType.option]
            else
                return [s.loc, NodeType.parameter]
        }
    }
    return [node.loc, NodeType.unknown]
}

function isEmptyParameter(line) {
    return line.left.trim().length > 0
        && line.left.endsWith(' ')
        && line.right == ''
}

function getWordAndType(line) {
    let pos = line.left.length - 1
    try {
        let ast = parseBash(line.left + line.right)
        let node = getNodeInPosition(ast, pos)
        let [loc, type] = getLocAndType(node, pos)
        if (loc == null && isEmptyParameter(line))
            return ['', NodeType.parameter]
        else if (type == NodeType.unknown)
            return ['', type]
        else
            //TODO get the full word by also accounting for line.right
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', NodeType.unknown]
    }
}


//------------------------- Completion search -------------------------

function safeGlob(paths, options) {
    try {
        return glob.sync(paths, options)
    }
    catch (err) {
        return []
    }
}

function getCommandCompletions(word) {
    if (word.includes('/'))
        // Should filter by executable attribute
        return getParameterCompletions(word)
    let paths = process.env.PATH
        .split(':')
        .map(p => p + '/' + word + '*')
    return safeGlob(paths)
        .map(w => w.split('/').pop())
        .concat(builtins.filter(w => w.startsWith(word)))
}

function replaceHomedirWithTilde(path, homedir) {
    if (path.startsWith(homedir)) {
        path = '~/' + path.substr(homedir.length)
    }
    return path
}

function getSubcommandCompletions(word, line) {
    // Notice: does not support commands after ";", "|", "&&", etc.
    let command = cutLastChars(line.left, word.length).trim()
    let subCommands = customCommands[command]
    if (!subCommands)
        return null
    if (subCommands instanceof Function)
        return subCommands(command, word, line)
    else
        return subCommands.filter(sc => startsWithCaseInsensitive(sc, word))
}

function getMatchingDirsAndFiles(word, homedir) {
    let dirsAndFiles = safeGlob(word, {
        onlyFiles: false,
        markDirectories: true,
        caseSensitiveMatch: false
    }).map(p => replaceHomedirWithTilde(p, homedir))
    // Put directories first, then files
    let dirs = dirsAndFiles.filter(p => p.endsWith('/'))
    let files = dirsAndFiles.filter(p => !p.endsWith('/'))
    return dirs.concat(files)
}

function getParameterCompletions(word, line) {
    // Special case: configured subcommand
    let subCommands = getSubcommandCompletions(word, line)
    if (subCommands)
        return subCommands
    // Accomodate word to glob
    let homedir = os.homedir() + '/'
    word = word.replace(/\\ /g, ' ')
    if (!word.includes('*'))
        word += '*'
    if (word.startsWith('~/'))
        word = homedir + word.substr(2)
    // Perform glob
    return getMatchingDirsAndFiles(word, homedir)
}

function getEnvironmentCompletions(word) {
    return Object.keys(process.env)
        .map(w => '$' + w)
        .filter(w => startsWithCaseInsensitive(w, word))
}

function getOptionCompletions(word) {
    //TODO provide general extension points for completion
    return []
}

function getCompletions(word, type, line) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return getCommandCompletions(word)
        case NodeType.parameter:
            return getParameterCompletions(word, line)
        case NodeType.environment:
            return getEnvironmentCompletions(word)
        case NodeType.option:
            return getOptionCompletions(word)
    }
}


//------------------------- Utilities -------------------------

function basename(filename) {
    let result = path.basename(filename)
    if (filename.endsWith('/'))
        result += '/'
    return result
}

function colorizePath(filename) {
    if (filename.endsWith('/'))
        return chalk.bold(filename)
    return filename
}

function replaceWordWithMatch(left, cutLen, match) {
    // Quote blanks in file names
    let qmatch = match.replace(/(\s)/g, '\\$1')
    // Add a space unless it's a directory
    if (!qmatch.endsWith('/'))
        qmatch += ' '
    return cutLastChars(left, cutLen) + qmatch
}

//------------------------- Key binding -------------------------

function showTableMenu(words, done, interactive = true) {
    process.stdout.write('\n')
    let options = words.map(basename).map(colorizePath)
    let cp = getCursorPosition()
    let { rows, columns, columnWidth } = computeTableLayout(options)
    if (interactive && rows > process.stdout.rows - 5)
        return null
    if (interactive && cp.y + rows >= process.stdout.rows)
        setCursorPosition({x: cp.x, y: process.stdout.rows - rows - 2})
    if (interactive)
        hideCursor()
    return tableMenu({ options, columns, columnWidth, done })
}

function showAllWords(line, word, words) {
    let menuDone = () => {}
    let menuKeyHandler = showTableMenu(words, sel => {
        showCursor()
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line.left = replaceWordWithMatch(line.left, word.length, words[sel])
        menuDone()
    })
    if (!menuKeyHandler)
        return null     // Too many items to show interactive menu
	return {
        isAsync: true,
        showPrompt: false,
		whenDone(done) {
            menuDone = done
		},
		keyListener(key) {
            //TODO handle plain keys, add them to line, update menu
            menuKeyHandler(key.ch, key)
        },
        getLine: () => line
	}
}

function tooManyWords(line, words) {
    process.stdout.write(`Do you wish to see all ${words.length} matches? `)
    let yesNoDone = () => {}
    return {
        isAsync: true,
        showPrompt: true,
        whenDone(done) {
            yesNoDone = done
        },
        keyListener(key) {
            if (key.ch == 'y' || key.ch == 'Y')
                showTableMenu(words, null, false)
            process.stdout.write('\n')
            yesNoDone()
        },
        getLine: () => line
    }
}

function completeWords(line, word, words) {
    let newLine = showAllWords(line, word, words)
    if (newLine)
        return newLine
    return tooManyWords(line, words)
}

function completeWord(line) {
    if (line.left.length == 0) return line
    let [word, type] = getWordAndType(line)
    words = getCompletions(word, type, line)
    if (words.length == 0) {
        // No match: do nothing
        return line
    }
    if (words.length == 1) {
        // Exactly one match: update line
        return {
            left: replaceWordWithMatch(line.left, word.length, words[0]),
            right: line.right
        }
    }
    else {
        // Multiple matches: interactive navigation
        return completeWords(line, word, words)
    }
}


bindKey('tab', completeWord, 'Complete word under cursor')
let customCommands = getOption('completion.commands')

module.exports = {
    completeWord,
    getWordAndType,
    NodeType,
    safeGlob
}
