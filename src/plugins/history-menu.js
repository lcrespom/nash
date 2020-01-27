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

function showHistoryMenu(line, options, decorate) {
    let menuDone = () => {}
    hideCursor()
    let menuKeyHandler = openVerticalMenu(options, decorate, sel => {
        showCursor()
        process.stdout.clearScreenDown()
        if (sel >= 0)
            line = { left: options[sel], right: '' }
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
        getLine: () => line
	}
}

function optionsMenu(line, options, decorate) {
    if (options.length == 0)
        return line
    if (options.length == 1)
        return { left: options[0], right: '' }
    options = options.reverse()
    return showHistoryMenu(line, options, decorate)
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
    let decorateDir = (o, sel) => {
        if (!o.endsWith('/')) o += '/'
        return sel ? inverse(o) : white(o)
    }
    line = optionsMenu(line, options, decorateDir)
    // All this craziness below just to prepend 'cd ' to the result
    if (line.isAsync) {
        let gl = line.getLine
        line.getLine = () => {
            let l = gl()
            if (l.left + l.right == '') return l
            return { left: 'cd ' + l.left, right: l.right }
        }
    }
    else {
        if (line.left + line.right != '')
            line.left = 'cd ' + line.left
    }
    return line
}


function start() {
    bindKey('pageup', historyMenu,
        'Show menu with matching history lines')
    bindKey('pagedown', dirHistoryMenu,
        'Show menu with matching directory history')
}


module.exports = { start }
