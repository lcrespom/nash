const { bindKey, getLastBinding, clearCommand } = require('../nash-plugins')
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
	//clearCommand()
	return {
		isAsync: true,
		whenDone: function(done) {
			let cmd = line.left + line.right
			if (cmd.trim().length > 0)
				history.push(cmd)
			runner.runCommand(cmd, done)
		},
		keyListener: function(key) {
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


function describeNextKey(line) {
	let commandDone = () => {}
	if (line.left.length + line.right.length > 0) return line
	process.stdout.write('\nType a key: ')
	return {
		isAsync: true,
		whenDone: function(done) {
			commandDone = done
		},
		keyListener: function(key) {
			process.stdout.write(key.name ? key.name : key.ch)
			process.stdout.write('\n')
			commandDone()
		}
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
