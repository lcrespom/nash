const path = require('path')
const chalk = require('chalk')

const { computeTableLayout, tableMenu } = require('node-terminal-menu')

const env = require('../env')
const { bindKey } = require('../key-bindings')
const {
    startsWithCaseInsensitive, cutLastChars, removeAnsiColorCodes
} = require('../utils')
const {
    parseBash, traverseAST, NodeType, builtins
} = require('../parser')
const { getPromptPosition, adjustPromptPosition } = require('../prompt')
const { getOption } = require('../startup')
const editor = require('../editor')


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
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', NodeType.unknown]
    }
}


//------------------------- Completion search -------------------------

async function safeGlob(paths, options) {
    try {
        return await env.glob(paths, options)
    }
    catch (err) {
        return []
    }
}

async function getCommandCompletions(word, line) {
    if (word.includes('/'))
        // Should filter by executable attribute
        return getParameterCompletions(word, line)
    let paths = process.env.PATH
        .split(path.delimiter)
        .map(p => p + '/' + word + '*')
    let words = await safeGlob(paths)
    return words.map(w => w.split('/').pop())
        .concat(builtins.filter(w => w.startsWith(word)))
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

function prependParentDir(dirs, word) {
    if (!word.endsWith('*'))
        return dirs
    let parent = word.slice(0, -1)    // remove *
    if (parent.length == 0)
        return ['../'].concat(dirs)
    if (!parent.endsWith('/'))
        return dirs
    let d = env.getUserStatus().cwd
    d = d.replace(/^~/, env.homedir())
    d = path.normalize(path.join(d, parent))
    if (d == '/')
        return dirs
    return [parent + '../'].concat(dirs)
}

async function getMatchingDirsAndFiles(word, homedir, line) {
    let dirsAndFiles = await safeGlob(word, {
        onlyFiles: false,
        markDirectories: true,
        caseSensitiveMatch: false
    })
    dirsAndFiles = dirsAndFiles.map(p => env.pathFromHome(p, homedir))
    // Put directories first, then files
    let dirs = dirsAndFiles.filter(p => p.endsWith('/'))
    dirs = prependParentDir(dirs, word)
    if (line.left.match(/^cd [^;&]*$/))
        return dirs
    let files = dirsAndFiles.filter(p => !p.endsWith('/'))
    return dirs.concat(files)
}

async function getParameterCompletions(word, line) {
    // Special case: configured subcommand
    let subCommands = getSubcommandCompletions(word, line)
    if (subCommands)
        return subCommands
        // Accomodate word to glob
    let homedir = env.homedir()
    word = word.replace(/\\ /g, ' ')
    if (word.startsWith('~/'))
        word = homedir + word.substr(1)
    if (!word.includes('*'))
        word += '*'
    // Perform glob
    return await getMatchingDirsAndFiles(word, homedir, line)
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

async function getCompletions(word, type, line) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return await getCommandCompletions(word, line)
        case NodeType.parameter:
            return await getParameterCompletions(word, line)
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

function shortenPath(p, isDir) {
    if (p.startsWith('/'))
        return path.normalize(p)
    let cwd = env.getUserStatus().cwd.replace(/^~/, env.homedir())
    p = path.relative(cwd, p)
    if (isDir && p.length > 0 && !p.endsWith('/'))
        p += '/'
    return p
}

function replaceWordWithMatch(left, word, match) {
    let cutLen = word.length
    // Normalize and simplify path
    let isDir = match.endsWith('/')
    match = shortenPath(match, isDir)
    // Quote blanks in file names
    let qmatch = match.replace(/(\s)/g, '\\$1')
    // Add a space unless it's a directory
    if (!isDir)
        qmatch += ' '
    // Preserve ./
    if (word.startsWith('./'))
        cutLen -= 2
    return cutLastChars(left, cutLen) + qmatch
}

//------------------------- Menu rendering -------------------------

function showTableMenu(items, done) {
    process.stdout.write('\n')
    let { rows, columns, columnWidth } =
        computeTableLayout(items, undefined, process.stdout.columns - 3)
    let height = rows, scrollBarCol = undefined
    if (rows > process.stdout.rows - 5) {
        height = process.stdout.rows - 5
        scrollBarCol = process.stdout.columns - 1
    }
    adjustPromptPosition(height + 1)
    return tableMenu({
        items, columns, columnWidth, done, height, scrollBarCol
    })
}

function updateMenu(menu, key, line, initialItems, initialLen) {
    if (key.ch) {
        line.left += key.ch
        line.word += key.ch
    }
    else if (line.left.length > initialLen) {
        line.left = line.left.slice(0, -1)
        line.word = line.word.slice(0, -1)
    }
    process.stdout.write('\n')
    let wordEnd = line.word.split('/').pop()
    let startsWith = (
        i => startsWithCaseInsensitive(removeAnsiColorCodes(i), wordEnd))
    let items = initialItems.filter(startsWith)
    if (items.length > 0) {
        if (menu.selection >= items.length)
            menu.selection = items.length - 1
        menu.update({ items })
    }
    else {
        process.stdout.clearScreenDown()
    }
    editor.writeLine(line)
    return items
}

function handleMenuKey(menu, key, line, items, initialItems, initialLen) {
    if (key.name == 'space') {
        editor.pressKey({ name: 'return' })
        setTimeout(
            () => editor.pressKey({ name: 'tab', navigating: true })
        , 100)
    }
    else if (key.ch || key.name == 'backspace') {
        items = updateMenu(menu, key, line, initialItems, initialLen)
    }
    else {
        process.stdout.write('\n')
        if (key.name == 'ctrl-c') key.name = 'escape'
        if (key.name == 'escape' || items.length > 0)
            menu.keyHandler(key.ch, key)
        editor.writeLine(line)
    }
    return items
}

function showAllWords(line, word, words) {
    let menuDone = () => {}
    let items = words
        .map(basename)
        .map(colorizePath)
        .map((w, i) => { let s = new String(w); s.from = words[i]; return s })
    let initialItems = items
    let initialLen = line.left.length
    line.word = word
    let menu = showTableMenu(items, sel => {
        line.left = line.left.substr(0, initialLen)
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line.left = replaceWordWithMatch(line.left, word, items[sel].from)
        menuDone({...line, showPrompt: false })
    })
    editor.writeLine(line)
    editor.onKeyPressed(key => {
        items = handleMenuKey(menu, key, line, items, initialItems, initialLen)
    })
    return new Promise(resolve => menuDone = resolve)
}

function completeCD() {
    function noEmptyCD(l) {
        if (l.left + l.right == 'cd ')
            return { left: '', right: '', showPrompt: false }
        return l
    }
    let line = completeWord({ left: 'cd ', right: '' })
    if (line.promise) {
        line.promise = line.promise.then(l => noEmptyCD(l))
        return line
    }
    else {
        return noEmptyCD(line)
    }
}


//------------------------- Key binding -------------------------

async function completeWord(line, key) {
    if (line.left + line.right == '')
        return completeCD()
    let [word, type] = getWordAndType(line)
    if (type == NodeType.unknown && line.left.endsWith('$'))
        [word, type] = ['$', NodeType.environment]
    let words = await getCompletions(word, type, line)
    let navigating = key && key.navigating
    if (words.length == 0 && !navigating) {
        // No match: do nothing
        return { ...line, showPrompt: false }
    }
    else if (words.length == 1 && !navigating) {
        // Exactly one match: update line
        return {
            left: replaceWordWithMatch(line.left, word, words[0]),
            right: line.right,
            showPrompt: false
        }
    }
    else {
        // Multiple matches: interactive navigation
        return showAllWords(line, word, words)
    }
}


let customCommands

function start() {
    bindKey('tab', completeWord, 'Complete word under cursor')
    customCommands = getOption('completion.commands')
}


module.exports = {
    completeWord,
    getWordAndType,
    NodeType,
    start
}
