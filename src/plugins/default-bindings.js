const {
	bindKey, getKeyBindings, getLastBinding, getBoundKeys
} = require('../key-bindings')
const { getPromptPosition } = require('../prompt')
const runner = require('../runner')
const { history } = require('../history')
const { getOption } = require('../startup')
const { colorize } = require('../colors')
const editor = require('../editor')


//--------------- Line movement and deletion ---------------

function removeLastChar(str) {
	return [
		str.charAt(str.length - 1),
		str.substring(0, str.length - 1)
	]
}

function removeFirstChar(str) {
	return [ str.charAt(0), str.substr(1) ]
}


function backwardDeleteChar(line) {
	if (line.left.length == 0) return line
	let [ch, left] = removeLastChar(line.left)
	return {
		left,
		right: line.right
	}
}

function deleteChar(line) {
	if (line.right.length == 0) return line
	let [ch, right] = removeFirstChar(line.right)
	return {
		left: line.left,
		right
	}
}

function backwardChar(line) {
	if (line.left.length == 0) return line
	let [ch, left] = removeLastChar(line.left)
	return {
		left,
		right: ch + line.right
	}
}

function forwardChar(line) {
	if (line.right.length == 0) return line
	let [ch, right] = removeFirstChar(line.right)
	return {
		left: line.left + ch,
		right
	}
}

function isLetterOrNum(ch) {
	if (ch >= '0' && ch <= '9')
		return true
	return ch.toLowerCase() != ch.toUpperCase()
}

function isStartOfWord(str, pos) {
	if (pos <= 0)
		return true
	return isLetterOrNum(str[pos]) && !isLetterOrNum(str[pos - 1])
}

function isEndOfWord(str, pos) {
	if (pos >= str.length)
		return true
	return !isLetterOrNum(str[pos]) && isLetterOrNum(str[pos - 1])
}

function backwardWord(line) {
	if (line.left.length == 0) return line
	for (let pos = line.left.length - 1; pos >= 0; pos--) {
		if (isStartOfWord(line.left, pos)) {
			return {
				left: line.left.substr(0, pos),
				right: line.left.substr(pos) + line.right
			}
		}
	}	
}

function forwardWord(line) {
	if (line.right.length == 0) return line
	for (let pos = 1; pos <= line.right.length; pos++) {
		if (isEndOfWord(line.right, pos)) {
			return {
				left: line.left + line.right.substr(0, pos),
				right: line.right.substr(pos)
			}
		}
	}
}

function beginningOfLine(line) {
	return {
		left: '',
		right: line.left + line.right
	}
}

function endOfLine(line) {
	return {
		left: line.left + line.right,
		right: ''
	}
}

function clearScreen(line) {
	process.stdout.cursorTo(0, 0)
	process.stdout.clearScreenDown()
	return {
		showPrompt: true,
		...line
	}
}

let clipboard = ''

function killWholeLine(line) {
	let cursor = getPromptPosition()
	if (cursor) {
		process.stdout.cursorTo(cursor.x, cursor.y)
	}
	process.stdout.clearScreenDown()
	clipboard = line.left + line.right
	return { left: '', right: '' }
}

function recoverDeletion(line) {
	// Recover line from killWholeLine, add it at cursor position
	return {
		left: line.left + clipboard,
		right: line.right
	}
}


//-------------------- History navigation --------------------

let hSearch = ''

function getSearchText(txt) {
	let lb = getLastBinding()
	if (lb != upLineOrHistory && lb != downLineOrHistory) {
		history.toEnd()
		hSearch = txt
	}
	return hSearch
}

function upLineOrHistory(line) {
	let left = history.back(getSearchText(line.left))
	if (left) return { left, right: '' }
	else return line
}

function downLineOrHistory(line) {
	let left = history.forward(getSearchText(line.left))
	if (left) return { left, right: '' }
	else return line
}


//--------------- Keys that break the editing process ---------------

function enterRemoteMode() {
	process.stdout.write('\x1b[30m')
	runner.write("\x05\x15PS1=$'\\x1E\\x1E>'\n")
}

function acceptLine(line) {
	let cmd = line.left + line.right
	if (cmd.trim().length > 0)
		history.push(cmd)
	editor.onKeyPressed(key => {
		if (key.name == 'ctrl-r')
			enterRemoteMode()
		else
			runner.write(key.ch || key.sequence)
	})
	editor.writeLine(line)
	return runner.runCommand(cmd)
}

function goodbye(line) {
	if (line.left.length + line.right.length > 0) return line
	history.close()
	line.left = 'exit'
	return acceptLine(line)
}

function discardLine() {
	return acceptLine({ left: '', right: '' })
}


//--------------- Interactive commands ---------------

function describeKeyBinding(kname, binding, cols) {
    return colorize(cols.quote, kname.padEnd(15) + '  ') +
		colorize(cols.program, binding.code.name.padEnd(20) + '  ') +
        colorize(cols.parameter, binding.desc)
}

function describeNextKey(line) {
	if (line.left.length + line.right.length > 0) return line
	return new Promise(resolve => {
		process.stdout.write('\nType a key: ')
		editor.onKeyPressed(key => {
			process.stdout.write(key.name ? key.name : key.ch)
			let bnds = getKeyBindings(key.name)
			if (bnds) {
				let hlColors = getOption('colors.syntaxHighlight')
				for (let bnd of bnds) {
					let desc = describeKeyBinding(key.name, bnd, hlColors)
					process.stdout.write('\r' + desc + '\n')
				}
			}
			else {
				process.stdout.write('\n')
			}
			resolve()
		})
	})
}

function listKeys(line) {
	let hlColors = getOption('colors.syntaxHighlight')
    for (let kname of getBoundKeys()) {
		let bnds = getKeyBindings(kname)
		for (let b of bnds)
	        process.stdout.write('\n' + describeKeyBinding(kname, b, hlColors))
    }
    process.stdout.write('\n')
    return {
        left: line.left,
        right: line.right,
        showPrompt: true
    }
}


function start() {
	// Line movement and deletion
	bindKey('backspace', backwardDeleteChar,
		'Delete character left of cursor')
	bindKey('delete', deleteChar, 'Delete char at cursor')
	bindKey('left', backwardChar, 'Move cursor left')
	bindKey('right', forwardChar, 'Move cursor right')
	bindKey(['home', 'ctrl-a'], beginningOfLine,
		'Move cursor to beginning of line')
	bindKey('ctrl-b', backwardWord, 'Move cursor one word to the left')
	bindKey('ctrl-f', forwardWord, 'Move cursor one word to the right')
	bindKey(['end', 'ctrl-e'], endOfLine, 'Move cursor to end of line')
	bindKey(['escape', 'ctrl-u'], killWholeLine, 'Clears the current line')
	bindKey('ctrl-y', recoverDeletion, 'Recover cleared line')
	bindKey('ctrl-l', clearScreen, 'Clears the screen')

	// History navigation
	bindKey('up', upLineOrHistory, 'Move backwards through history')
	bindKey('down', downLineOrHistory, 'Move forward through history')

	// Keys that break the editing process
	bindKey('return', acceptLine, 'Run command in line')
	bindKey('ctrl-d', goodbye, 'Close terminal (only if line is empty)')
	bindKey('ctrl-c', discardLine, 'Discards the line')

	// Interactive commands
	bindKey('ctrl-k', describeNextKey,
		'Names typed key (to be used with the binkdKey function)')
	bindKey('f1', listKeys, 'Lists all key bindings')
}


module.exports = { start }
