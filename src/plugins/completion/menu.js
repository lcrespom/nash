const path = require('path')

const { computeTableLayout, tableMenu } = require('node-terminal-menu')

const requireNash = m => require('../../' + m)
const env = requireNash('env')
const { startsWithCaseInsensitive, cutLastChars } = requireNash('utils')
const { adjustPromptPosition } = requireNash('prompt')
const editor = requireNash('editor')
const { colorize } = requireNash('colors')
const docparser = require('./doc-parser')


//------------------------- Utilities -------------------------

function basename(filename) {
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

function relativePath(cwd, p) {
    let oldcwd = process.cwd
    process.cwd = _ => cwd  // Monkey-patch process.cwd()
    let result = path.relative(cwd, p)
    process.cwd = oldcwd
    return result
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
    // Make path relative to cwd
    p = relativePath(cwd, p)
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

class EditableMenu {
    constructor(line, word, words, colors, menuColors) {
        this.line = line
        this.word = word
        this.words = words
        this.colors = colors
        this.menuColors = menuColors
    }

    open() {
        let menuDone = () => {}
        this.items = this.words.map(w => {
            let [ word, ...desc ] = w.split('##')
            desc = desc.length > 0 ? desc.join('##') : undefined
            let plainLabel = basename(word)
            return {
                word,
                desc,
                plainLabel,
                label: colorizePath(plainLabel, this.colors)
            }
        })
        this.initialLen = this.line.left.length
        this.search = this.word
        this.menu = this.showTableMenu(sel => {
            this.line.left = this.line.left.substr(0, this.initialLen)
            process.stdout.clearScreenDown()
            if (sel >= 0)
                this.line.left = replaceWordWithMatch(
                    this.line.left, this.word, this.items[sel].word)
            menuDone({...this.line, showPrompt: false })
        })
        this.initialItems = this.items
        editor.writeLine(this.line)
        editor.onKeyPressed(key => this.handleMenuKey(key))
        return new Promise(resolve => menuDone = resolve)
    }

    showTableMenu(done) {
        this.cursorToMenu(this.line)
        let labels = this.items.map(item => item.label)
        let { rows, columns, columnWidth } =
            computeTableLayout(labels, undefined, process.stdout.columns - 3)
        columnWidth = this.adjustColumnWidth(columns, columnWidth)
        let width = columns * columnWidth
        this.items = this.items.map(item => ({
            ...item,
            desc: docparser.wrap(item.desc, width - 1, 3)
        }))
        let descs = this.items.map(item => item.desc)
        let height = rows, scrollBarCol = undefined
        if (rows > process.stdout.rows - 8) {
            height = process.stdout.rows - 8
            scrollBarCol = columns * columnWidth + 1
        }
        let descRows = 0
        if (descs.some(d => d)) descRows = 3
        adjustPromptPosition(height + 1 + descRows)
        let menu = tableMenu({
            items: labels, descs, descRows,
            columns, columnWidth, height, scrollBarCol,
            done,
            colors: this.menuColors
        })
        menu.width = width
        return menu
    }
    
    handleMenuKey(key) {
        if (key.name == 'space') {
            editor.pressKey({ name: 'return' })
            setTimeout(
                () => editor.pressKey({ name: 'tab', navigating: true })
            , 100)
        }
        else if (key.ch || key.name == 'backspace') {
            this.updateMenu(key)
        }
        else {
            this.cursorToMenu()
            if (key.name == 'ctrl-c') key.name = 'escape'
            if (key.name == 'escape' || this.items.length > 0)
                this.menu.keyHandler(key.ch, key)
            editor.writeLine(this.line)
        }
    }

    updateSearch(key) {
        if (key.ch) {
            this.line.left += key.ch
            this.search += key.ch
        }
        else if (this.line.left.length > this.initialLen) {
            this.line.left = this.line.left.slice(0, -1)
            this.search = this.search.slice(0, -1)
        }
    }

    updateMenu(key) {
        this.updateSearch(key)
        this.cursorToMenu()
        let wordEnd = this.search.split('/').pop()
        this.items = this.initialItems.filter(
            item => startsWithCaseInsensitive(item.plainLabel, wordEnd)
        )
        if (this.items.length > 0) {
            // Todo move this "if" inside the menu package
            if (this.menu.selection >= this.items.length)
                this.menu.selection = this.items.length - 1
            this.menu.update({
                items: this.items.map(item => item.label),
                descs: this.items.map(item => item.desc)
            })
        }
        else {
            process.stdout.clearScreenDown()
        }
        editor.writeLine(this.line)
    }

    cursorToMenu() {
        let h = this.line.h === undefined ? 0 : this.line.h
        process.stdout.write('\n'.repeat(h + 1))
    }

    adjustColumnWidth(columns, columnWidth) {
        if (!this.items.some(item => item.desc))
            return columnWidth
        let w = columns * columnWidth
        let cols = process.stdout.columns
        if (w + 8 > cols)
            return columnWidth
        return Math.floor((cols - 2) / columns)
    }

}


module.exports = {
    replaceWordWithMatch,
    EditableMenu
}
