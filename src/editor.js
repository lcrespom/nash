const print = console.log.bind(console)

let line = {
	left: '',
	right: ''
}

function put(str) {
	process.stdout.write(str)
}

function prompt() {
	return 'nash> '
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

function handleKeypress(ch, key) {
	if (isPlainKey(ch, key)) {
		put(ch)
		line.left += ch		//TODO account for cursor position
	}
	else {
		//applyBinding(ch, key)
		debugKey(ch, key)
	}
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause()
	}
}


module.exports = {
	handleKeypress,
	prompt,
	print,
	put
}