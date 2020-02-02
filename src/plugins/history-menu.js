const { verticalMenu } = require('node-terminal-menu')

const { substrWithColors, memoize, removeRepeatedItems } = require('../utils')
const { bindKey } = require('../key-bindings')
const { adjustPromptPosition } = require('../prompt')
const { history, dirHistory } = require('../history')
const { highlight, colorize } = require('./syntax-highlight')
const { runCommand } = require('../runner')
const editor = require('../editor')


function highlightCommand(cmd) {
    let hls = highlight(cmd)
    let colCmd = colorize(cmd, hls)
    return substrWithColors(colCmd, 0, process.stdout.columns - 2)
}

function inverse(str) {
    return '\x1b[7m' + str + '\x1b[0m'
}

function white(str) {
    return '\x1b[97m' + str + '\x1b[0m'
}

function openVerticalMenu(items, decorate, done) {
    process.stdout.write('\n')
    let rows = Math.min(process.stdout.rows - 10, items.length)
    adjustPromptPosition(rows + 1)
    return verticalMenu({
        items,
        height: rows,
        selection: items.length - 1,
        decorate,
        done
    })
}

function updateMenu(menu, key, line, initialItems, initialLen, filter) {
    if (key.ch) line.left += key.ch
    else if (line.left.length > initialLen)
        line.left = line.left.slice(0, -1)
    process.stdout.write('\n')
    let items = initialItems.filter(i => filter(i, line.left))
    if (items.length > 0) {
        let height = Math.min(process.stdout.rows - 10, items.length)
        let selection = items.length - 1
        menu.update({ items, selection, height, scrollStart: 0 })
    }
    else {
        process.stdout.clearScreenDown()
    }
    editor.writeLine(line)
    return items
}

function showHistoryMenu(line, items,
    { decorate, updateLine, runIt, filter }) {
    let menuDone = () => {}
    let initialItems = items
    let initialLen = line.left.length
    line.decorateHint = 'no suggestions'
    let menu = openVerticalMenu(items, decorate, sel => {
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line = updateLine({ left: items[sel], right: '' })
        if (runIt && sel >= 0)
            runCommand(line.left, userStatus => menuDone({ userStatus }))
        else
            menuDone({ ...line, showPrompt: false })
    })
    editor.writeLine(line)
	return {
        promise: new Promise(resolve => menuDone = resolve),
		keyListener(key) {
            if (key.ch || key.name == 'backspace')
                items = updateMenu(menu, key, line, initialItems, initialLen, filter)
            else if (items.length > 0) {
                process.stdout.write('\n')
                menu.keyHandler(key.ch, key)
                editor.writeLine(line)
            }
        }
	}
}

function startsWith(item, text) {
    return item.startsWith(text)
}

function includes(item, text) {
    return item.includes(text)
}

function historyMenu(line, items,
    { decorate, updateLine = l => l, runIt = false, filter = startsWith}) {
    if (items.length == 0)
        return line
    if (items.length == 1)
        return updateLine({ left: items[0], right: '' })
    return showHistoryMenu(line, items,
        { decorate, updateLine, runIt, filter })
}

function cmdHistoryMenu(line) {
    let highlightCommandMemo = memoize(highlightCommand)
    let items = history.matchLines(line.left)
    let decorate =
        (o, sel) => sel ? inverse(o) : highlightCommandMemo(o)
    return historyMenu(line, items, { decorate })
}


function dirHistoryMenu(line) {
    let items = dirHistory.matchLines(line.left, includes)
    // Ensure items are chronological and unique
    items = removeRepeatedItems(items.reverse()).reverse()
    // If no filtering text, remove current directory
    if (line.left == '') items.splice(-1, 1)
    let decorate = (o, sel) => {
        if (!o.endsWith('/')) o += '/'
        return sel ? inverse(o) : white(o)
    }
    let updateLine = l => ({ left: 'cd ' + l.left, right: l.right })
    return historyMenu(line, items,
        { decorate, updateLine, runIt: true, filter: includes })
}


function start() {
    bindKey('pageup', cmdHistoryMenu,
        'Show menu with matching command history lines')
    bindKey('pagedown', dirHistoryMenu,
        'Show menu with matching directory history')
}


module.exports = { start }
