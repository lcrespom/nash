const { hideCursor, showCursor, verticalMenu } = require('node-terminal-menu')

const { substrWithColors, memoize, removeRepeatedItems } = require('../utils')
const { bindKey } = require('../key-bindings')
const { getCursorPosition, setCursorPosition } = require('../prompt')
const { history, dirHistory } = require('../history')
const { highlight, colorize } = require('./syntax-highlight')
const { runCommand } = require('../runner')


function highlightCommand(cmd) {
    let hls = highlight(cmd)
    let colCmd = colorize(cmd, hls)
    return substrWithColors(colCmd, 0, process.stdout.columns - 2)
}

const highlightCommandMemo = memoize(highlightCommand)

function inverse(str) {
    return '\x1b[7m' + str + '\x1b[0m'
}

function white(str) {
    return '\x1b[97m' + str + '\x1b[0m'
}

function openVerticalMenu(items, decorate, done) {
    process.stdout.write('\n')
    let cp = getCursorPosition()
    let rows = Math.min(process.stdout.rows - 10, items.length)
    if (cp.y + rows >= process.stdout.rows)
        setCursorPosition({x: cp.x, y: process.stdout.rows - rows - 2})
    return verticalMenu({
        items,
        height: rows,
        selection: items.length - 1,
        decorate,
        done
    })
}

function showHistoryMenu(line, items,
    { decorate, updateLine = l => l, runIt = false }) {
    let menuDone = () => {}
    hideCursor()
    let menuKeyHandler = openVerticalMenu(items, decorate, sel => {
        showCursor()
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line = updateLine({ left: items[sel], right: '' })
        if (runIt) {
            let cmd = line.left
            line = { left: '', right: ''}
            runCommand(cmd, uStatus => {
                let cp = getCursorPosition()
                process.stdout.cursorTo(0, cp.y)
                process.stdout.clearLine(1)
                menuDone(uStatus)
            })
        }
        else
            menuDone()
    })
	return {
        isAsync: true,
        showPrompt: runIt,
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

function historyMenu(line, items, options) {
    if (items.length == 0)
        return line
    if (items.length == 1)
        return updateLine({ left: items[0], right: '' })
    return showHistoryMenu(line, items, options)
}

function cmdHistoryMenu(line) {
    let items = history.matchLines(line.left)
    let decorate =
        (o, sel) => sel ? inverse(o) : highlightCommandMemo(o)
    return historyMenu(line, items, { decorate })
}


function dirHistoryMenu(line) {
    let includes = (i, t) => i.includes(t)
    let items = dirHistory.matchLines(line.left, includes)
    // Ensure items are chronological and unique
    items = removeRepeatedItems(items.reverse()).reverse()
    //Remove current directory
    items.splice(-1, 1)
    let decorate = (o, sel) => {
        if (!o.endsWith('/')) o += '/'
        return sel ? inverse(o) : white(o)
    }
    let updateLine = l => ({ left: 'cd ' + l.left, right: l.right })
    return historyMenu(line, items,
        { decorate, updateLine, runIt: true })
}


function start() {
    bindKey('pageup', cmdHistoryMenu,
        'Show menu with matching command history lines')
    bindKey('pagedown', dirHistoryMenu,
        'Show menu with matching directory history')
}


module.exports = { start }
