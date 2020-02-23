const { tableMenu } = require('node-terminal-menu')

const { memoize, removeRepeatedItems } = require('../utils')
const { getOption, setDefaultOptions } = require('../startup')
const { bindKey } = require('../key-bindings')
const prompt = require('../prompt')
const { history, dirHistory } = require('../history')
const { colorizer } = require('../colors')
const { runCommand } = require('../runner')
const editor = require('../editor')
const env = require('../env')
const terminal = require('../terminal')
const syntaxHL = require('./syntax-highlight')


function highlightCommand(cmd) {
    let hls = syntaxHL.highlight(cmd)
    return syntaxHL.colorize(cmd, hls)
}

function startsWith(item, text) {
    return item.startsWith(text)
}

function includes(item, text) {
    return item.includes(text)
}

function inverse(str) {
    return terminal.INVERSE + str + terminal.NORMAL
}

function white(str) {
    return terminal.WHITE + str + terminal.NORMAL
}


//------------------------- Menu class -------------------------

class HistoryMenu {

    constructor(line, items,
        { decorate, updateLine = l => l, runIt = false, filter = startsWith }) {
        this.line = line
        this.items = items
        this.decorate = decorate
        this.updateLine = updateLine
        this.runIt = runIt
        this.filter = filter
        this.width = this.computeWidth(items)
    }

    open() {
        if (this.items.length == 0)
            return this.line
        if (this.items.length == 1)
            return this.updateLine({ left: this.items[0], right: '' })
        return this.showHistoryMenu()
    }

    showHistoryMenu() {
        let menuDone = () => {}
        let initialItems = this.items
        let initialLen = this.line.left.length
        this.menu = this.openMenuWidget(sel => {
            process.stdout.clearScreenDown()
            if (sel >= 0)
                this.line = this.updateLine({ left: this.items[sel], right: '' })
            if (this.runIt && sel >= 0)
                runCommand(this.line.left).then(menuDone)
            else
                menuDone({ ...this.line, showPrompt: false })
        })
        editor.writeLine(this.line)
        editor.onKeyPressed(key => {
            if (key.ch || key.name == 'backspace')
                this.items = this.updateMenu(key, initialItems, initialLen)
            else {
                process.stdout.write('\n')
                if (key.name == 'ctrl-c') key.name = 'escape'
                if (key.name == 'escape' || this.items.length > 0)
                    this.menu.keyHandler(key.ch, key)
                editor.writeLine(this.line)
            }
        })
        return new Promise(resolve => menuDone = resolve)
    }

    openMenuWidget(done) {
        process.stdout.write('\n')
        let height = Math.min(process.stdout.rows - 10, this.items.length)
        prompt.adjustPromptPosition(height + 1)
        return tableMenu({
            items: this.items,
            height, columnWidth: this.width, columns: 1,
            scrollBarCol: this.width + 1,
            selection: this.items.length - 1,
            colors: this.initColors(),
            done
        })
    }

    updateMenu(key, initialItems, initialLen) {
        if (key.ch) this.line.left += key.ch
        else if (this.line.left.length > initialLen)
            this.line.left = this.line.left.slice(0, -1)
        process.stdout.write('\n')
        let items = initialItems.filter(i => this.filter(i, this.line.left))
        if (items.length > 0) {
            let height = Math.min(process.stdout.rows - 10, items.length)
            let selection = items.length - 1
            this.menu.update({ items, selection, height, scrollStart: 0 })
        }
        else {
            process.stdout.clearScreenDown()
        }
        editor.writeLine(this.line)
        return items
    }

    initColors() {
        let colors = getOption('colors.history')
        return {
            item:
                i => colorizer(colors.item)(this.decorate(i, false)),
            selectedItem:
                i => colorizer(colors.selectedItem)(this.decorate(i, true)),
            scrollArea: colorizer(colors.scrollArea),
            scrollBar: colorizer(colors.scrollBar)
        }
    }

    computeWidth(items) {
        let w = items.reduce((w, i) => Math.max(w, i.length), 0)
        return Math.min(w + 2, process.stdout.columns - 3)
    }
    
}


//------------------------- Main -------------------------

function cmdHistoryMenu(line) {
    let highlightCommandMemo = memoize(highlightCommand)
    let items = history.matchLines(line.left)
    let decorate =
        (o, sel) => sel ? inverse(o) : highlightCommandMemo(o)
    let hm = new HistoryMenu(line, items, { decorate })
    return hm.open()
}


function dirHistoryMenu(line) {
    let items = dirHistory.matchLines(line.left, includes)
    // Ensure items are chronological and unique
    items = removeRepeatedItems(items.reverse()).reverse()
    let cwd = env.cwd()
    // Remove current directory from list (user is already there)
    items = items.filter(i => i != cwd)
    let decorate = (o, sel) => sel ? inverse(o) : white(o)
    let updateLine = l => ({ left: 'cd ' + l.left, right: l.right })
    let hm = new HistoryMenu(line, items,
        { decorate, updateLine, runIt: true, filter: includes })
    return hm.open()
}

function setDefaults() {
    let defaultColors = {
        item: '/#272822',
        selectedItem: '',
		scrollArea: '/#272822',
        scrollBar: 'whiteBright',
    }
    setDefaultOptions('colors.history', defaultColors)
}

function start() {
    setDefaults()
    bindKey('pageup', cmdHistoryMenu,
        'Show menu with matching command history lines')
    bindKey('pagedown', dirHistoryMenu,
        'Show menu with matching directory history')
}


module.exports = { start }
