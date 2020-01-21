const os = require('os')

const { removeAnsiColorCodes } = require('./utils')


let cursorX = 0
let cols = 80
let cursor = null

// Default prompt function
let prompt = (pinfo) => 'nash> '


/**
 * Sets the function that will be invoked for building the prompt string
 * @param {function(object): string} promptFunction - The function that will be
 *  invoked whenever the prompt needs to be displayed. This function should
 *  return a string, which will be presented to the user when typing a command.
 *
 * The prompt function receives a single object parameter with relevant
 * information about the environment, which can be optionally used by the
 * prompt function in order to build the prompt string.
 * Those properties are the following:
 * 	- cwd: the current working directory
 *  - username: the current user name
 *  - hostname: the host name
 *  - fqdn: the fully qualified domain name of the host
 *  - retCode: the return code of the most recent command
 */
function setPrompt(promptFunction) {
	prompt = promptFunction
}

function put(str) {
	process.stdout.write(str)
}

function getPromptInfo(userStatus) {
	// Working directory
	let cwd = userStatus.cwd || process.cwd()
	let homedir = os.homedir()
	if (cwd.startsWith(homedir))
		cwd = '~' + cwd.substr(homedir.length)
	// Username
	let username = userStatus.username || os.userInfo().username
	// Host name (full and local)
	let fqdn = os.hostname()
	let hostname = fqdn.split('.')[0]
	// Return code
	let retCode = userStatus.retCode || 0
	// All together
	return {
		cwd,
		username,
		hostname,
		fqdn,
		retCode
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
		cursor = {
			x: parseInt(m[2]) - 1,
			y: parseInt(m[1]) - 1
		}
		put(SHOW_TEXT)
	})
}

function getCursorPosition() {
	if (cursor) {
		return cursor
	}
	else {
		return { x: cursorX }
	}
}

function setCursorPosition(newCursor) {
	if (cursor) {
		if (newCursor.x !== undefined)
			cursor.x = newCursor.x
		if (newCursor.y !== undefined)
			cursor.y = newCursor.y
	}
	else {
		if (newCursor.x !== undefined)
			cursorX = newCursor.x
	}
}

function putPrompt(userStatus = {}) {
	let promptStr = prompt(getPromptInfo(userStatus))
	put(promptStr)
	cursor = null
    put(HIDE_TEXT + GET_CURSOR_POS)
    let lastLine = promptStr.split('\n').pop()
	cursorX = removeAnsiColorCodes(lastLine).length
	cols = process.stdout.columns
}

function putCursor(len) {
	if (cursor) {
		let ll = cursor.x + len
		let x = ll % cols
		let y = cursor.y + Math.floor(ll / cols)
		process.stdout.cursorTo(x, y)
	}
	else {
		process.stdout.cursorTo(cursorX + len)
	}
}

function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}


captureCursorPosition()


module.exports = {
    setPrompt,
    putPrompt,
    putCursor,
	getCursorPosition,
	setCursorPosition,
	setTerminalTitle
}