let keyBindings = {}
let prompt = () => 'nash> '

let status = {
	cursorX: 0,
	cols: 80,
	line: {
		left: '',
		right: ''
	}
}


function getKeyBinding(key) {
	let name = key.name
	if (key.meta) name = 'meta_' + key
	let binding = keyBindings[name]
	return binding ? binding[0] : undefined
}

function bindKey(key, code, desc) {
	keyBindings[key] = [code, desc]
}

function setPrompt(code) {
	prompt = code
}

const print = console.log.bind(console)

function put(str) {
	process.stdout.write(str)
}

function putPrompt() {
	let promptStr = prompt()
	put(promptStr)
	status.cursorX = promptStr.length
	status.cols = process.stdout.columns
	// Check https://stackoverflow.com/questions/8343250/how-can-i-get-position-of-cursor-in-terminal
}

function applyBinding(key) {
	let b = getKeyBinding(key)
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
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause()
		return
	}
	else if (isPlainKey(ch, key)) {
		newLine = {
			left: status.line.left + ch,
			right: status.line.right
		}
	}
	else {
		newLine = applyBinding(key)
		//debugKey(ch, key)
	}
	//runner.waitForRunner(() => updateLine(newLine))
	updateLine(newLine)
}


module.exports = {
	handleKeypress,
	print,
	getKeyBinding,
	bindKey,
	setPrompt,
	putPrompt
}