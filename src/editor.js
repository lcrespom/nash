const os = require('os')


let keyBindings = {}
let prompt = (pinfo) => 'nash> '

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

function bindKey(knames, code, desc) {
	if (!Array.isArray(knames))
		knames = [ knames ]
	for (let key of knames)
		keyBindings[key] = [code, desc]
}

function setPrompt(code) {
	prompt = code
}

const print = console.log.bind(console)

function put(str) {
	process.stdout.write(str)
}

function removeAnsiColorCodes(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function getPromptInfo() {
	let cwd = process.cwd()
	let homedir = os.homedir()
	if (cwd.startsWith(homedir))
		cwd = '~' + cwd.substr(homedir.length)
	let username = os.userInfo().username
	let fqdn = os.hostname()
	let hostname = fqdn.split('.')[0]
	return {
		cwd,
		username,
		hostname,
		fqdn
	}
}

function putPrompt(clearLine = true) {
	let promptStr = prompt(getPromptInfo())
	put(promptStr)
	status.cursorX = removeAnsiColorCodes(promptStr).length
	status.cols = process.stdout.columns
	if (clearLine)
		updateLine({ left: '', right: '' })
}

function debugKey(ch, key) {
	let code = ch ? ` (${ch.charCodeAt(0)})` : ''
	print(`\nch: '${ch}'${code}`, '- key:', key)
}

function reportUnknownKey(key) {
	print('\nUnbound key: ' + key.name)
	putPrompt(false)
	return status.line
}

function improveKeyName(key) {
	// Name ctrl+char 'ctrl-char' and meta+char 'meta-char'
	if (key.name.length > 1) return			// Key already has a proper name
	if (!(key.ctrl || key.meta)) return		// No ctrl or meta is pressed
	if (key.meta)
		key.name = 'meta-' + key.name
	if (key.ctrl)
		key.name = 'ctrl-' + key.name
}

function applyBinding(key) {
	improveKeyName(key)
	let b = getKeyBinding(key)
	if (!b) return reportUnknownKey(key)
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

function updateLine(newLine) {
	process.stdout.cursorTo(status.cursorX)
	let fullLine = newLine.left + newLine.right
	put(fullLine)
	if (status.cursorX + fullLine.length > status.cols) {
		//TODO multi-line editing
	}
	process.stdout.clearLine(1)
	process.stdout.cursorTo(status.cursorX + removeAnsiColorCodes(newLine.left).length)
	status.line = newLine
}

function handleKeypress(ch, key) {
	let newLine
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause()
		print()
		return
	}
	else if (isPlainKey(ch, key)) {
		newLine = {
			left: status.line.left + ch,
			right: status.line.right
		}
		updateLine(newLine)
	}
	else {
		newLine = applyBinding(key)
		//TODO: deal with asynchronous bindings
		if (!newLine.isAsync) {
			updateLine(newLine)
		}
	}
}


module.exports = {
	handleKeypress,
	print,
	getKeyBinding,
	bindKey,
	setPrompt,
	putPrompt
}