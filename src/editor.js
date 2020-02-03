const {
	putCursorAtPrompt, getPromptPosition, lineEndPosition,
	hideCursor, showCursor, 
	putPrompt, promptOwnsInput
} = require('./prompt')
const { getKeyBindings, setLastBinding } = require('./key-bindings')
const { removeAnsiColorCodes } = require('./utils')


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
		if (newLine.promise || newLine.showPrompt)
			break
	}
	return newLine
}

function writeLine(newLine) {
	newLine.left = newLine.left || ''
	newLine.right = newLine.right || ''
	let fullLine = decorateLine(newLine)
	hideCursor()	// Hide cursor to avoid glitches
	putCursorAtPrompt(0)
	process.stdout.write(fullLine +  ' ')
	process.stdout.clearLine(1)
	putCursorAtPrompt(newLine.left.length)
	let { h } = lineEndPosition(removeAnsiColorCodes(fullLine).length)
	let cursor = getPromptPosition()
	if (h > 0 && cursor.y + h >= process.stdout.rows)
		cursor.y = process.stdout.rows - h - 1
	showCursor()
	line = {
		left: newLine.left,
		right: newLine.right
	}
}

function doNothingKeyListener(key) {}

async function handlePromise(line) {
	if (line.left || line.right)
		writeLine(line)
	keyListener = line.keyListener || doNothingKeyListener
	line.promise.then(async (newLine = {}) => {
		keyListener = editorKeyListener
		if (newLine.showPrompt !== false)
			await putPrompt()
		writeLine(newLine)
	})
}

async function editorKeyListener(key) {
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
		if (newLine.promise)
			return handlePromise(newLine)
		else {
			if (newLine.showPrompt === true)
				await putPrompt()
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

function initialize() {
	putPrompt().then(_ => writeLine({ left: '', right: '' }))
}

module.exports = {
	handleKeypress,
	registerLineDecorator,
	writeLine,
	initialize
}
