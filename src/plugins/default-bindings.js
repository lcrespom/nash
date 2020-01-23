const {
	bindKey, getKeyBinding, getLastBinding, getBoundKeys
} = require('../key-bindings')
const { getCursorPosition } = require('../prompt')
const runner = require('../runner')
const history = require('../history')


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

function killWholeLine(line) {
	let cursor = getCursorPosition()
	if (cursor) {
		process.stdout.cursorTo(cursor.x, cursor.y)
	}
	process.stdout.clearScreenDown()
	return { left: '', right: '' }
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

function acceptLine(line) {
	return {
		isAsync: true,
		left: line.left,
		right: line.right,
		decorateHint: 'no suggestions',
		whenDone(done) {
			let cmd = line.left + line.right
			if (cmd.trim().length > 0)
				history.push(cmd)
			runner.runCommand(cmd, done)
		},
		keyListener(key) {
			runner.write(key.ch || key.sequence)
		}
	}
}

function goodbye(line) {
	if (line.left.length + line.right.length > 0) return line
	history.save()
	line.left = 'exit'
	return acceptLine(line)
}

function discardLine() {
	return acceptLine({ left: '', right: '' })
}


//--------------- Interactive commands ---------------

function describeKeyBinding(kname, binding) {
    return kname.padEnd(12) + '  ' +
        binding.code.name.padEnd(20) + '  ' +
        binding.desc
}

function describeNextKey(line) {
	let commandDone = () => {}
	if (line.left.length + line.right.length > 0) return line
	process.stdout.write('\nType a key: ')
	return {
		isAsync: true,
		whenDone(done) {
			commandDone = done
		},
		keyListener(key) {
			process.stdout.write(key.name ? key.name : key.ch)
            let bnd = getKeyBinding(key.name)
            if (bnd)
                process.stdout.write(
                    '\r' + describeKeyBinding(key.name, bnd))
			process.stdout.write('\n')
			commandDone()
		}
	}
}

function listKeys(line) {
    for (let kname of getBoundKeys()) {
        let b = getKeyBinding(kname)
        process.stdout.write('\n' + describeKeyBinding(kname, b))
    }
    process.stdout.write('\n')
    return {
        left: line.left,
        right: line.right,
        showPrompt: true
    }
}


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
