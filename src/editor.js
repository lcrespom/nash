const { putPrompt, putCursor } = require('./prompt')
const { getKeyBinding, setLastBinding } = require('./key-bindings')


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

function applyBinding(key) {
	let b = getKeyBinding(key.name)
	if (!b || !b.code)
		return unknownKey(key)
	let newLine = b.code(line)
	setLastBinding(b.code)
	return newLine
}

function writeLine(newLine) {
	let fullLine = decorateLine(newLine)
	putCursor(0)
	process.stdout.write(fullLine +  ' ')
	process.stdout.clearLine(1)
	putCursor(newLine.left.length)
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
		newLine = applyBinding(key)
		if (newLine.isAsync) {
			if (newLine.left || newLine.right)
				writeLine(newLine)
			keyListener = newLine.keyListener || doNothingKeyListener
			newLine.whenDone(userStatus => {
				keyListener = editorKeyListener
				if (newLine.showPrompt !== false) {
					putPrompt(userStatus)
					writeLine({ left: '', right: '' })
				}
				if (newLine.getLine) {
					writeLine(newLine.getLine())
				}
			})
		}
		else {
			if (newLine.showPrompt === true)
				putPrompt()
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
	if (key.ctrl)
		key.name = 'ctrl-' + key.name
}

function analyzeKey(ch, key) {
	if (key === undefined) key = {}
	key.plain = isPlainKey(ch, key)
	if (key.plain) key.ch = ch
	else improveKeyName(key)
	return key
}

function handleKeypress(ch, key) {
	key = analyzeKey(ch, key)
	keyListener(key)
}

function getWelcomeMessage() {
	return 'Welcome to nash (https://github.com/lcrespom/nash)\n' +
		'Press F1 for help on keyboard commands\n'
}

function initialize() {
	process.stdout.write(getWelcomeMessage())
	putPrompt()
	setTimeout(() => {
		// Avoid glitch where the cursor is misplaced upon startup
		writeLine({ left: '', right: '' })
	}, 50)
}

module.exports = {
	handleKeypress,
	registerLineDecorator,
	initialize
}