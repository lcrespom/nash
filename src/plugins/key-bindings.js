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

function acceptLine(line) {
	runner.runCommand(line.left + line.right)
	return { left: '', right: '', isAsync: true }
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


bindKey('backspace', backwardDeleteChar, 'Delete character left of cursor')
bindKey('left', backwardChar, 'Move cursor left')
bindKey('right', forwardChar, 'Move cursor right')
bindKey(['home', 'ctrl-a'], beginningOfLine, 'Move cursor to beginning of line')
bindKey(['end', 'ctrl-e'], endOfLine, 'Move cursor to end of line')
bindKey('return', acceptLine, 'Run command in line')
bindKey('up', upLineOrHistory, 'Move backwards through history')
bindKey('down', downLineOrHistory, 'Move forward through history')
