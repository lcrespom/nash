const os = require('os')


let prompt = (pinfo) => 'nash> '

let status = {
	cursorX: 0,
	cols: 80,
	line: {
		left: '',
		right: ''
	},
	keyListener: editorKeyListener,
	lastBinding: null
}


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
	// print('\nUnbound key: ' + key.name)
	// console.dir(key)
	//putPrompt(false)
	return {
		left: status.line.left,
		right: status.line.right
	}
}

function applyBinding(key) {
	let b = getKeyBinding(key)
	if (!b) return unknownKey(key)
	let newLine = b(status.line)
	status.lastBinding = b
	return newLine
}

function getLastBinding() {
	return status.lastBinding
}


//-------------------- Prompt --------------------

/**
 * Sets the function that will be invoked for building the prompt string
 * @param {function(object): string} promptFunction - The function that will be invoked
 * 	whenever the prompt needs to be displayed. This function should return
 * 	a string, which will be presented to the user when typing a command.
 *
 * The prompt function receives a single object parameter with relevant
 * information about the environment, which can be optionally used by the
 * prompt function in order to build the prompt string.
 * Those properties are the following:
 * 	- cwd: the current working directory
 *  - username: the current user name
 *  - hostname: the host name
 *  - fqdn: the fully qualified domain name of the host
 */
function setPrompt(promptFunction) {
	prompt = promptFunction
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

const HIDE_TEXT = '\x1b[30m\x1b[?25l'
const SHOW_TEXT = '\x1b[0m\x1b[?25h'
const GET_CURSOR_POS = '\x1b[6n'

function captureCursorPosition() {
	process.stdin.on('data', buf => {
		let s = buf.toString()
		if (buf.length < 6) return
		let m = s.match(/\x1b\[([0-9]+);([0-9]+)R/)
		if (!m || m.length < 3) return
		status.cursor = {
			x: parseInt(m[2]) - 1,
			y: parseInt(m[1]) - 1
		}
		put(SHOW_TEXT)
	})
}

function putPrompt(clearLine = true) {
	let promptStr = prompt(getPromptInfo())
	put(promptStr)
	status.cursor = null
	put(HIDE_TEXT + GET_CURSOR_POS)
	status.cursorX =
		removeAnsiColorCodes(promptStr)
		.split('\n').pop().length
	status.cols = process.stdout.columns
	status.rows = 0
	if (clearLine)
		updateLine({ left: '', right: '' })
}


//-------------------- Line & key handling --------------------

function putCursor(len) {
	if (status.cursor) {
		let ll = status.cursor.x + len
		let x = ll % status.cols
		let y = status.cursor.y + Math.floor(ll / status.cols)
		process.stdout.cursorTo(x, y)
	}
	else {
		process.stdout.cursorTo(status.cursorX + len)
	}
}

function updateLine(newLine) {
	let fullLine = newLine.left + newLine.right
	let len = removeAnsiColorCodes(newLine.left).length
	putCursor(0)
	put(fullLine +  ' ')
	process.stdout.clearLine(1)
	putCursor(len)
	status.line = {
		left: newLine.left,
		right: newLine.right
	}
}

function doNothingKeyListener(key) {}

function editorKeyListener(key) {
	let newLine
	if (key.plain) {
		newLine = {
			left: status.line.left + key.ch,
			right: status.line.right
		}
		updateLine(newLine)
		status.lastBinding = null
	}
	else {
		newLine = applyBinding(key)
		if (newLine.isAsync) {
			status.keyListener = newLine.keyListener || doNothingKeyListener
			newLine.whenDone(() => {
				status.keyListener = editorKeyListener
				if (newLine.showPrompt !== false)
					putPrompt()
				if (newLine.left !== undefined)
					updateLine(newLine)
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
	status.keyListener(key)
}


captureCursorPosition()

module.exports = {
	handleKeypress,
	print,
	bindKey,
	getLastBinding,
	setPrompt,
	putPrompt
}