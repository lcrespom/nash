const os = require('os')


let keyBindings = {}
let prompt = (pinfo) => 'nash> '

let status = {
	cursorX: 0,
	cols: 80,
	line: {
		left: '',
		right: ''
	},
	keyListener: editorKeyListener
}


function getKeyBinding(key) {
	let name = key.name
	if (key.meta) name = 'meta_' + key
	let binding = keyBindings[name]
	return binding ? binding[0] : undefined
}


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

function applyBinding(key) {
	let b = getKeyBinding(key)
	if (!b) return reportUnknownKey(key)
	return b(status.line)
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

function doNothingKeyListener(key) {}

function editorKeyListener(key) {
	let newLine
	if (key.plain) {
		newLine = {
			left: status.line.left + key.ch,
			right: status.line.right
		}
		updateLine(newLine)
	}
	else {
		newLine = applyBinding(key)
		if (newLine.isAsync) {
			status.keyListener = newLine.keyListener || doNothingKeyListener
			newLine.whenDone(() => {
				status.keyListener = editorKeyListener
				if (newLine.showPrompt !== false)
					putPrompt()
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
	// Name ctrl+char 'ctrl-char' and meta+char 'meta-char'
	if (key.name.length > 1) return			// Key already has a proper name
	if (!(key.ctrl || key.meta)) return		// No ctrl or meta is pressed
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


module.exports = {
	handleKeypress,
	print,
	getKeyBinding,
	bindKey,
	setPrompt,
	putPrompt
}