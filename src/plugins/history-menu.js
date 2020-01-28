const { hideCursor, showCursor, verticalMenu } = require('node-terminal-menu')

const { substrWithColors, memoize, removeRepeatedItems } = require('../utils')
const { bindKey } = require('../key-bindings')
const { getCursorPosition, setCursorPosition } = require('../prompt')
const { history, dirHistory } = require('../history')
const { highlight, colorize } = require('./syntax-highlight')


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

function openVerticalMenu(options, decorate, done) {
    process.stdout.write('\n')
    let cp = getCursorPosition()
    let rows = Math.min(process.stdout.rows - 10, options.length)
    if (cp.y + rows >= process.stdout.rows)
        setCursorPosition({x: cp.x, y: process.stdout.rows - rows - 2})
    return verticalMenu({
        options,
        height: rows,
        selection: options.length - 1,
        decorate,
        done
    })
}

function showHistoryMenu(line, options, decorate, updateLine) {
    let menuDone = () => {}
    let selection
    hideCursor()
    let menuKeyHandler = openVerticalMenu(options, decorate, sel => {
        showCursor()
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line = { left: options[sel], right: '' }
        selection = sel
        menuDone()
    })
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
        getLine: () => selection >= 0 ? updateLine(line) : line
	}
}

function optionsMenu(line, options, decorate, updateLine = l => l) {
    if (options.length == 0)
        return line
    if (options.length == 1)
        return updateLine({ left: options[0], right: '' })
    options = options.reverse()
    return showHistoryMenu(line, options, decorate, updateLine)
}

function historyMenu(line) {
    let options = history.matchBackwards(line.left)
    let decorateCommand =
        (o, sel) => sel ? inverse(o) : highlightCommandMemo(o)
    return optionsMenu(line, options, decorateCommand)
}


function dirHistoryMenu(line) {
    let includes = (i, t) => i.includes(t)
    let options = dirHistory.matchBackwards(line.left, includes)
    options = removeRepeatedItems(options)
    if (options.length > 0)
        options.splice(0, 1)  // Current directory is not required
    let decorateDir = (o, sel) => {
        if (!o.endsWith('/')) o += '/'
        return sel ? inverse(o) : white(o)
    }
    let prependCD = l => ({ left: 'cd ' + l.left, right: l.right })
    return optionsMenu(line, options, decorateDir, prependCD)
}


function start() {
    bindKey('pageup', historyMenu,
        'Show menu with matching history lines')
    bindKey('pagedown', dirHistoryMenu,
        'Show menu with matching directory history')
}


module.exports = { start }
