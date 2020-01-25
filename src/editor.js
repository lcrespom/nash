const {
	putPrompt, putCursor, hideCursor, showCursor, promptOwnsInput
} = require('./prompt')
const { getKeyBindings, setLastBinding } = require('./key-bindings')


let line = { left: '', right: '' }
let keyListener = editorKeyListener


//-------------------- Line decoration --------------------

let lineDecorators = []

function registerLineDecorator(decorator) {
	lineDecorators.push(decorator)
}

function decorateLine(line) {
	let plainLine = line.left + line.right
	let decoratedLine = plainLine
	for (let decorator of lineDecorators) {
		decoratedLine = decorator(plainLine, decoratedLine, line)
	}
	return decoratedLine
}


//-------------------- Line & key handling --------------------

function unknownKey(key) {
	return {
		left: line.left,
		right: line.right
	}
}

function applyBindings(key) {
	let bindings = getKeyBindings(key.name)
	if (!bindings || bindings.length == 0)
		return unknownKey(key)
	let newLine = line
	for (let b of bindings) {
		newLine = b.code(newLine, key)
		setLastBinding(b.code)
		if (newLine.isAsync || newLine.showPrompt)
			break
	}
	return newLine
}

function writeLine(newLine) {
	let fullLine = decorateLine(newLine)
	hideCursor()	// Hide cursor to avoid glitches
	process.stdout.write('\x1b[?25l')
	putCursor(0)
	process.stdout.write(fullLine +  ' ')
	process.stdout.clearLine(1)
	putCursor(newLine.left.length)
	showCursor()
	line = {
		left: newLine.left,
		right: newLine.right
	}
}

function doNothingKeyListener(key) {}

function editorKeyListener(key) {
	let newLine
	if (key.plain) {
		newLine = {
			left: line.left + key.ch,
			right: line.right
		}
		writeLine(newLine)
		setLastBinding(null)
	}
	else {
		newLine = applyBindings(key)
		if (newLine.isAsync) {
			if (newLine.left || newLine.right)
				writeLine(newLine)
			keyListener = newLine.keyListener || doNothingKeyListener
			newLine.whenDone(userStatus => {
				keyListener = editorKeyListener
				if (newLine.showPrompt !== false) {
					putPrompt(userStatus).then(_ =>
						writeLine(newLine.getLine
							? newLine.getLine()
							: { left: '', right: '' }
						)
					)
				}
				else if (newLine.getLine) {
					writeLine(newLine.getLine())
				}
			})
		}
		else {
			if (newLine.showPrompt === true)
				putPrompt().then(_ => writeLine(newLine))
			else
				writeLine(newLine)
		}
	}
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

function improveKeyName(key) {
	if (key.shift)
		key.name = 'shift-' + key.name
	if (key.meta)
		key.name = 'meta-' + key.name
	if (key.ctrl) {
		if (key.name == '`' && key.sequence == '\u0000')
			key.name = 'space' //WTF when pressing ctrl-space
		key.name = 'ctrl-' + key.name
	}
}

function analyzeKey(ch, key) {
	if (key === undefined) key = {}
	key.plain = isPlainKey(ch, key)
	if (key.plain) key.ch = ch
	else improveKeyName(key)
	return key
}

function handleKeypress(ch, key) {
	if (promptOwnsInput()) return
	key = analyzeKey(ch, key)
	keyListener(key)
}

function getWelcomeMessage() {
	return 'Welcome to nash (https://github.com/lcrespom/nash)\n' +
		'Press F1 for help on keyboard commands\n'
}

function initialize() {
	process.stdout.write(getWelcomeMessage())
	putPrompt().then(_ => writeLine({ left: '', right: '' }))
}

module.exports = {
	handleKeypress,
	registerLineDecorator,
	initialize
}
