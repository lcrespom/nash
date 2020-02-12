const path = require('path')

const { computeTableLayout, tableMenu } = require('node-terminal-menu')

const requireNash = m => require('../../' + m)
const env = requireNash('env')
const { bindKey } = requireNash('key-bindings')
const {
    startsWithCaseInsensitive, cutLastChars, removeAnsiColorCodes
} = requireNash('utils')
const { NodeType } = requireNash('parser')
const { adjustPromptPosition } = requireNash('prompt')
const { getOption, setDefaultOptions } = requireNash('startup')
const editor = requireNash('editor')
const { colorize, colorizer } = requireNash('colors')
const {
    getWordAndType, getCompletions, setCustomCommands
} = require('./completion-search')


//------------------------- Utilities -------------------------

function basename(filename) {
    let result = path.basename(filename.toString())
    if (filename.endsWith('/'))
        result += '/'
    return result
}

function colorizePath(filename) {
    if (filename.endsWith('/'))
        return colorize(colors.dirs, filename)
    else if (filename.startsWith('-'))
        return colorize(colors.options, filename)
    else
        return colorize(colors.files, filename)
}

function shortenPath(word, p, isDir) {
    // Remove redundant ../
    p = path.normalize(p)
    // Absolute path should not be made relative
    if (word.startsWith('/'))
        return p
    // Get working directory absolute path
    let cwd = env.cwd().replace(/^~/, env.homedir())
    // Replace ~ with home absolute path, if present
    p = p.replace(/^~/, env.homedir())
    // Make path relative to cwd, local version
    if (!env.getUserStatus().isRemote)
        p = path.relative(cwd, p)
    // Make path relative to cwd, remote version
    else if (p.startsWith('./') || p.startsWith('../'))
        p = path.normalize(path.join(cwd, p))
    // Finally, add '/' if it's a directory
    if (isDir && p.length > 0 && !p.endsWith('/'))
        p += '/'
    return p
}

function replaceWordWithMatch(left, word, match) {
    let cutLen = word.length
    // Normalize and simplify path
    let isDir = match.endsWith('/')
    match = shortenPath(word, match, isDir)
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

function cursorToMenu(line) {
    let h = line.h === undefined ? 0 : line.h
    process.stdout.write('\n'.repeat(h + 1))
}

function showTableMenu(line, items, done) {
    cursorToMenu(line)
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
        descs: items.map(i => i.desc),
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
    cursorToMenu(line)
    let wordEnd = line.word.split('/').pop()
    let startsWith = (
        i => startsWithCaseInsensitive(removeAnsiColorCodes(i), wordEnd))
    let items = initialItems.filter(startsWith)
    if (items.length > 0) {
        if (menu.selection >= items.length)
            menu.selection = items.length - 1
        menu.update({ items, descs: items.map(i => i.desc) })
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
        cursorToMenu(line)
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
        .map((w, i) => {
            let s = new String(w)
            s.from = words[i]
            s.desc = words[i].desc
            return s
        })
    let initialItems = items
    let initialLen = line.left.length
    line.word = word
    let menu = showTableMenu(line, items, sel => {
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
        options: 'magentaBright',
		items: '/#272822',
		scrollArea: '/#272822',
        scrollBar: 'whiteBright',
        desc: 'cyanBright /#223030'
    }
    setDefaultOptions('colors.completion', defaultColors)
    colors = getOption('colors.completion')
    menuColors = {
        item: colorizer(colors.items),
        scrollArea: colorizer(colors.scrollArea),
        scrollBar: colorizer(colors.scrollBar),
        desc: colorizer(colors.desc)
    }
}

function start() {
    setDefaults()
    bindKey('tab', completeWord, 'Complete word under cursor')
    setCustomCommands(getOption('completion.commands'))
}


module.exports = {
    getWordAndType,
    getCompletions,
    NodeType,
    start
}
