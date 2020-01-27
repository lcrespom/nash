const { hideCursor, showCursor, verticalMenu } = require('node-terminal-menu')

const { substrWithColors, memoize } = require('../utils')
const { bindKey } = require('../key-bindings')
const { getCursorPosition, setCursorPosition } = require('../prompt')
const history = require('../history')
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

function openVerticalMenu(options, done) {
    process.stdout.write('\n')
    let cp = getCursorPosition()
    let rows = Math.min(process.stdout.rows - 10, options.length)
    if (cp.y + rows >= process.stdout.rows)
        setCursorPosition({x: cp.x, y: process.stdout.rows - rows - 2})
    return verticalMenu({
        options,
        height: rows,
        selection: options.length - 1,
        decorate(o, sel) {
            if (sel) return inverse(o)
            return highlightCommandMemo(o)
        },
        done
    })
}

function showHistoryMenu(line, options) {
    let menuDone = () => {}
    hideCursor()
    let menuKeyHandler = openVerticalMenu(options, sel => {
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

function historyMenu(line) {
    let options = history.matchBackwards(line.left)
    if (options.length == 0)
        return line
    if (options.length == 1)
        return { left: options[1], right: '' }
    options = options.reverse()
    //TODO highlight the last N to avoid performance impact
    //options = options.map(highlightCommand)
    //TODO menu pgup, pgdown
    return showHistoryMenu(line, options)
}

bindKey('pageup', historyMenu, 'Show menu with matching history lines')