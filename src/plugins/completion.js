const path = require('path')

const { computeTableLayout, tableMenu } = require('node-terminal-menu')

const env = require('../env')
const { bindKey } = require('../key-bindings')
const {
    startsWithCaseInsensitive, cutLastChars, removeAnsiColorCodes
} = require('../utils')
const { NodeType } = require('../parser')
const { adjustPromptPosition } = require('../prompt')
const { getOption, setDefaultOptions } = require('../startup')
const editor = require('../editor')
const { colorize, colorizer } = require('../colors')
const {
    getWordAndType, getCompletions, setCustomCommands
} = require('./completion-search')


//------------------------- Utilities -------------------------

function basename(filename) {
    let result = path.basename(filename)
    if (filename.endsWith('/'))
        result += '/'
    return result
}

function colorizePath(filename) {
    if (filename.endsWith('/'))
        return colorize(colors.dirs, filename)
    return colorize(colors.files, filename)
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
        scrollBarCol = columns * columnWidth + 1
    }
    adjustPromptPosition(height + 1)
    return tableMenu({
        items,
        columns, columnWidth, height, scrollBarCol,
        done,
        colors: menuColors
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


let colors
let menuColors

function setDefaults() {
    let defaultColors = {
		dirs: 'yellowBright',
		files: 'cyan',
		items: '/#272822',
		scrollArea: '/#272822',
        scrollBar: 'whiteBright'
    }
    setDefaultOptions('colors.completion', defaultColors)
    colors = getOption('colors.completion')
    menuColors = {
        item: colorizer(colors.items),
        scrollArea: colorizer(colors.scrollArea),
        scrollBar: colorizer(colors.scrollBar)
    }
}

function start() {
    setDefaults()
    bindKey('tab', completeWord, 'Complete word under cursor')
    setCustomCommands(getOption('completion.commands'))
}


module.exports = {
    completeWord,
    getWordAndType,
    NodeType,
    start
}
