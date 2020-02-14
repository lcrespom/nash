const path = require('path')

const { computeTableLayout, tableMenu } = require('node-terminal-menu')

const requireNash = m => require('../../' + m)
const env = requireNash('env')
const {
    startsWithCaseInsensitive, cutLastChars, removeAnsiColorCodes
} = requireNash('utils')
const { adjustPromptPosition } = requireNash('prompt')
const editor = requireNash('editor')
const { colorize } = requireNash('colors')
const docparser = require('./doc-parser')


//------------------------- Utilities -------------------------

function basename(filename) {
    filename = filename.toString()
    // Do not split options
    if (filename.startsWith('-'))
        return filename
    // It's a path
    let result = path.basename(filename)
    if (filename.endsWith('/'))
        result += '/'
    return result
}

function colorizePath(filename, colors) {
    if (filename.endsWith('/'))
        return colorize(colors.dirs, filename)
    else if (filename.startsWith('-'))
        return colorize(colors.options, filename)
    else
        return colorize(colors.files, filename)
}

function shortenPath(word, p, isDir) {
    // Menu items are not string literals
    p = p.toString()
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
    // If the path is shorter from ~, return it in that format
    if (!path.isAbsolute(p)) {
        let p2 = env.pathFromHome(path.normalize(path.join(cwd, p)), env.homedir())
        if (p2.length < p.length) return p2
    }
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


//------------------------- Menu -------------------------

function cursorToMenu(line) {
    let h = line.h === undefined ? 0 : line.h
    process.stdout.write('\n'.repeat(h + 1))
}

function adjustColumnWidth(columns, columnWidth, items) {
    if (!items.some(item => item.desc))
        return columnWidth
    let w = columns * columnWidth
    let cols = process.stdout.columns
    if (w + 8 > cols)
        return columnWidth
    return Math.floor((cols - 2) / columns)
}

function showTableMenu(line, items, menuColors, done) {
    cursorToMenu(line)
    let { rows, columns, columnWidth } =
        computeTableLayout(items, undefined, process.stdout.columns - 3)
    columnWidth = adjustColumnWidth(columns, columnWidth, items)
    let width = columns * columnWidth
    let descs = items.map(i => docparser.wrap(i.desc, width - 1, 3))
    let height = rows, scrollBarCol = undefined
    if (rows > process.stdout.rows - 8) {
        height = process.stdout.rows - 8
        scrollBarCol = columns * columnWidth + 1
    }
    let descRows = 0
    if (descs.some(d => d)) descRows = 3
    adjustPromptPosition(height + 1 + descRows)
    let menu = tableMenu({
        items, descs, descRows,
        columns, columnWidth, height, scrollBarCol,
        done,
        colors: menuColors
    })
    menu.width = width
    return menu
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
        let descs = items.map(i => docparser.wrap(i.desc, menu.width - 1, 3))
        if (menu.selection >= items.length)
            menu.selection = items.length - 1
        menu.update({ items, descs })
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

function showAllWords(line, word, words, colors, menuColors) {
    let menuDone = () => {}
    let items = words
        .map(basename)
        .map(p => colorizePath(p, colors))
        .map((w, i) => {
            let s = new String(w)
            s.from = words[i]
            s.desc = words[i].desc
            return s
        })
    let initialItems = items
    let initialLen = line.left.length
    line.word = word
    let menu = showTableMenu(line, items, menuColors, sel => {
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


module.exports = {
    showAllWords,
    replaceWordWithMatch
}
