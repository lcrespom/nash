const { bindKey } = require('../nash-plugins')
const runner = require('../runner')
const history = require('../history')


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


function upLineOrHistory(line) {
	let left = history.back()
	if (left) return { left, right: '' }
	else return line
}

function downLineOrHistory(line) {
	let left = history.forward()
	if (left) return { left, right: '' }
	else return line
}


function acceptLine(line) {
	let commandDone = () => {}
	runner.runCommand(line.left + line.right, () => commandDone())
	return {
		isAsync: true,
		whenDone: function(done) {
			commandDone = done
		}
	}
}

function goodbye(line) {
	if (line.left.length + line.right.length > 0) return line
	process.stdin.pause()
	process.stdout.write('\n')
	return {
		isAsync: true,
		whenDone: function(done) { done() }
	}
}

function discardLine() {
	return acceptLine({ left: '', right: '' })
}


function describeNextKey() {
	if (line.left.length + line.right.length > 0) return line
	//TODO wait for asynchronous binding support from editor
	process.stdout.write('\nType a key: ')
}


// Line movement and deletion
bindKey('backspace', backwardDeleteChar, 'Delete character left of cursor')
bindKey('delete', deleteChar, 'Delete char at cursor')
bindKey('left', backwardChar, 'Move cursor left')
bindKey('right', forwardChar, 'Move cursor right')
bindKey(['home', 'ctrl-a'], beginningOfLine, 'Move cursor to beginning of line')
bindKey(['end', 'ctrl-e'], endOfLine, 'Move cursor to end of line')

// History navigation
bindKey('up', upLineOrHistory, 'Move backwards through history')
bindKey('down', downLineOrHistory, 'Move forward through history')

// Keys that break the editing process
bindKey('return', acceptLine, 'Run command in line')
bindKey('ctrl-d', goodbye, 'Close terminal (only if line is empty)')
bindKey('ctrl-c', discardLine, 'Discards the line')

// Interactive commands
// bindKey('ctrl-k', describeNextKey,
// 	'Names typed key (to be used with the binkdKey function)')
