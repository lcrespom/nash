const bindings = require('./key-bindings')


const print = console.log.bind(console)

let status = {
	cursorX: 0,
	cols: 80,
	line: {
		left: '',
		right: ''
	}
}

function put(str) {
	process.stdout.write(str)
}

function prompt() {
	let promptStr = 'nash > '
	put(promptStr)
	status.cursorX = promptStr.length
	status.cols = process.stdout.columns
	// Check https://stackoverflow.com/questions/8343250/how-can-i-get-position-of-cursor-in-terminal
}

function applyBinding(key) {
	let b = bindings.getBinding(key)
	if (!b) return {
		left: status.line.left + '*',
		right: status.line.right
	}
	return b(status.line)
}

function isPlainKey(ch, key) {
	const SPACE = 32
	const BACKSPACE = 127
	if (key === undefined) return true // Unicode characters
	if (key.meta || key.ctrl) return false
	if (!ch) return false
	let code = ch.charCodeAt(0)
	if (ch.length == 1 && code >= SPACE && code != BACKSPACE) return true
	return false
	//TODO: emojis are not supported by kepress
	//	fork, fix and send pull request
}

function debugKey(ch, key) {
	let code = ch ? ` (${ch.charCodeAt(0)})` : ''
	print(`\nch: '${ch}'${code}`, '- key:', key)
}

function updateLine(newLine) {
	process.stdout.cursorTo(status.cursorX)
	let fullLine = newLine.left + newLine.right
	put(fullLine)
	if (status.cursorX + fullLine.length > status.cols) {
		//TODO multi-line editing
	}
	process.stdout.clearLine(1)
	process.stdout.cursorTo(status.cursorX + newLine.left.length)
	status.line = newLine
}

function handleKeypress(ch, key) {
	let newLine
	if (isPlainKey(ch, key)) {
		newLine = {
			left: status.line.left + ch,
			right: status.line.right
		}
	}
	else {
		newLine = applyBinding(key)
		//debugKey(ch, key)
	}
	updateLine(newLine)
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause()
	}
}


module.exports = {
	handleKeypress,
	prompt,
	print,
}