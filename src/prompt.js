const os = require('os')

const { fromHomedir } = require('./utils')


let cursor = null
let lastUserStatus = {}

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
	lastUserStatus = userStatus
	// Working directory
	let cwd = userStatus.cwd || fromHomedir(process.cwd(), os.homedir())
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

const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'
const HIDE_TEXT = '\x1b[30m' + HIDE_CURSOR
const SHOW_TEXT = '\x1b[0m' + SHOW_CURSOR
const GET_CURSOR_POS = '\x1b[6n'

function hideCursor() {
	put(HIDE_CURSOR)
}

function showCursor() {
	put(SHOW_CURSOR)
}

let cursorCB = null
let captureBuf = ''

function promptOwnsInput() {
	return !!cursorCB
}

function captureCursorPosition() {
	process.stdin.on('data', buf => {
		if (!cursorCB) return
		captureBuf += buf.toString()
		if (captureBuf.length < 6) return
		let m = captureBuf.match(/\x1b\[([0-9]+);([0-9]+)R/)
		if (!m || m.length < 3) return
		cursor = {
			x: parseInt(m[2]) - 1,
			y: parseInt(m[1]) - 1
		}
		put(SHOW_TEXT)
		cursorCB(cursor)
		cursorCB = null
		captureBuf = ''
	})
}

function getPromptPosition() {
	return cursor
}

function adjustPromptPosition(rows) {
	if (cursor.y + rows >= process.stdout.rows)
		cursor.y = process.stdout.rows - rows - 1
}

function putPrompt(userStatus = lastUserStatus) {
	let promptStr = prompt(getPromptInfo(userStatus))
	put(promptStr)
	cursor = null
    put(HIDE_TEXT + GET_CURSOR_POS)
	return new Promise(resolve => cursorCB = resolve)
}

function lineEndPosition(len) {
	let ll = cursor.x + len
	let cols = process.stdout.columns
	let x = ll % cols
	let h = Math.floor(ll / cols)
	return { x, h }
}

function putCursorAtPrompt(lineLen) {
	let { x, h } = lineEndPosition(lineLen)
	process.stdout.cursorTo(x, cursor.y + h)
}

function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}


captureCursorPosition()


module.exports = {
    setPrompt,
	putPrompt,
	hideCursor,
	showCursor,
	putCursorAtPrompt,
	lineEndPosition,
	promptOwnsInput,
	getPromptPosition,
	adjustPromptPosition,
	setTerminalTitle
}
