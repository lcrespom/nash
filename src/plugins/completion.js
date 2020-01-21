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


//------------------------- AST Searching -------------------------

function insideLoc(loc, pos) {
    return loc.start.char <= pos && pos <= loc.end.char
}

function getNodeInPosition(ast, pos) {
    let node = null
    let minDist = Number.MAX_VALUE
    traverseAST(ast, n => {
        if (insideLoc(n.loc, pos)) {
            node = n
        }
    })
    return node
}

function getLocAndType(node, pos) {
    if (!node) return [null, NodeType.unknown]
    if (node.type != 'Command') return [node.loc, NodeType.unknown]
    if (insideLoc(node.name.loc, pos)) return [node.name.loc, NodeType.command]
    if (!node.suffix) return [node.loc, NodeType.unknown]
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
    return  [node.loc, NodeType.unknown]
}

function getWordAndType(line) {
    let pos = line.left.length - 1
    try {
        let ast = parseBash(line.left + line.right)
        let node = getNodeInPosition(ast, pos)
        let [loc, type] = getLocAndType(node, pos)
        if (type == NodeType.unknown)
            return ['', type]
        else
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', NodeType.unknown]
    }
}


//------------------------- Suggestions -------------------------

function safeGlob(paths, options) {
    try {
        return glob.sync(paths, options)
    }
    catch (err) {
        return []
    }
}

function getCommandSuggestions(word) {
    if (word.includes('/'))
        return getParameterSuggestions(word)
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

function getParameterSuggestions(word) {
    let homedir = os.homedir() + '/'
    if (!word.includes('*'))
        word += '*'
    if (word.startsWith('~/'))
        word = homedir + word.substr(2)
    return safeGlob(word, {
        onlyFiles: false,
        markDirectories: true,
        caseSensitiveMatch: false
    }).map(p => replaceHomedirWithTilde(p, homedir))
}

function getEnvironmentSuggestions(word) {
    return Object.keys(process.env)
        .map(w => '$' + w)
        .filter(w => startsWithCaseInsensitive(w, word))
}

function getOptionSuggestions(word) {
    //TODO eventually provide extension points for completion
    return []
}

function getSuggestions(word, type) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return getCommandSuggestions(word)
        case NodeType.parameter:
            return getParameterSuggestions(word)
        case NodeType.environment:
            return getEnvironmentSuggestions(word)
        case NodeType.option:
            return getOptionSuggestions(word)
    }
}


//------------------------- Key binding -------------------------

function findCommonStart(word) {
    let lastw = words[0]
    for (let i = 1; i < words.length; i++) {
        cic = commonInitialChars(lastw, words[i])
        if (cic == 0)
            return ''
        lastw = lastw.substr(0, cic)
    }
    return lastw
}

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
            line.left = cutLastChars(line.left, word.length) + words[sel]
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
    let start = findCommonStart(words)
    if (start.length <= word.length) {
        let newLine = showAllWords(line, word, words)
        if (newLine)
            return newLine
        return tooManyWords(line, words)
    }
    return {
        left: cutLastChars(line.left, word.length) + start,
        right: line.right
    }
}

function completeWord(line) {
    if (line.left.length == 0) return line
    let [word, type] = getWordAndType(line)
    words = getSuggestions(word, type)
    if (words.length == 0) {
        return line
    }
    if (words.length == 1) {
        return {
            left: cutLastChars(line.left, word.length) + words[0],
            right: line.right
        }
    }
    else {
        return completeWords(line, word, words)
    }
}


bindKey('tab', completeWord, 'Complete word under cursor')

module.exports = {
    completeWord,
    getWordAndType,
    NodeType
}