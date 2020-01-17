const { removeAnsiColorCodes } = require('./utils')
const { putPrompt, putCursor } = require('./prompt')


let line = { left: '', right: '' }
let keyListener = editorKeyListener
let lastBinding = null


//-------------------- Key bindings --------------------

let keyBindings = {}

/**
 * Binds a given key or key combination to a function, which will be invoked
 * 	by the editor when the key is pressed.
 *
 * @param {String | String[]} knames - The key name. If an array is given,
 * 	the binding is applied to multiple keys.
 * @param {Function} code - The function to invoke when the key is pressed.
 * @param {String} desc - A description of what the binding does.
 *
 * When the end user types the bound key and the function provided in the
 * `code` parameter is invoked, it receives an object parameter with the
 * current editor line, split in the `left` and `right` properties with the
 * cursor in the middle.
 * The binding function can either be synchronous or asynchronous.
 *
 * If synchronous, it must return an object with a `left` and `right` string
 * properties, which will be used to update the editor line.
 *
 * If asynchronous, it must return an object with the following properties:
 * - isAsync: set to true to indicate that the function is asynchronous
 * - whenDone: a function that the editor will invoke passing a callback
 *   function, which should be invoked when the asynchronous function
 *   has finished.
 */
function bindKey(knames, code, desc) {
	if (!Array.isArray(knames))
		knames = [ knames ]
	for (let key of knames)
		keyBindings[key] = [code, desc]
}

function getKeyBinding(key) {
	let name = key.name
	if (key.meta) name = 'meta_' + key
	let binding = keyBindings[name]
	return binding ? binding[0] : undefined
}

function unknownKey(key) {
	return {
		left: line.left,
		right: line.right
	}
}

function applyBinding(key) {
	let b = getKeyBinding(key)
	if (!b) return unknownKey(key)
	let newLine = b(line)
	lastBinding = b
	return newLine
}

function getLastBinding() {
	return lastBinding
}


//-------------------- Line & key handling --------------------

function updateLine(newLine) {
	let fullLine = newLine.left + newLine.right
	let len = removeAnsiColorCodes(newLine.left).length
	putCursor(0)
	process.stdout.write(fullLine +  ' ')
	process.stdout.clearLine(1)
	putCursor(len)
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
		updateLine(newLine)
		lastBinding = null
	}
	else {
		newLine = applyBinding(key)
		if (newLine.isAsync) {
			keyListener = newLine.keyListener || doNothingKeyListener
			newLine.whenDone(userStatus => {
				keyListener = editorKeyListener
				if (newLine.showPrompt !== false) {
					putPrompt(userStatus)
					updateLine({ left: '', right: '' })
				}
				if (newLine.left !== undefined) {
					updateLine(newLine)
				}
			})
		}
		else {
			if (newLine.showPrompt === true)
				putPrompt()
			updateLine(newLine)
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

function initialize() {
	putPrompt()
	updateLine({ left: '', right: '' })
}

module.exports = {
	handleKeypress,
	bindKey,
	getLastBinding,
	initialize
}