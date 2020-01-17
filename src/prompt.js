const os = require('os')

const { removeAnsiColorCodes } = require('./utils')


let prompt = (pinfo) => 'nash> '

let status = {
	cursorX: 0,
	cols: 80,
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

function put(str) {
	process.stdout.write(str)
}

function getPromptInfo(userStatus) {
	let cwd = userStatus.cwd || process.cwd()
	let homedir = os.homedir()
	if (cwd.startsWith(homedir))
		cwd = '~' + cwd.substr(homedir.length)
	let username = userStatus.username || os.userInfo().username
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

function getCursorPosition() {
	if (status.cursor) {
		return status.cursor
	}
	else {
		return { x: status.cursorX }
	}
}

function putPrompt(userStatus = {}) {
	let promptStr = prompt(getPromptInfo(userStatus))
	put(promptStr)
	status.cursor = null
	put(HIDE_TEXT + GET_CURSOR_POS)
	status.cursorX =
		removeAnsiColorCodes(promptStr)
		.split('\n').pop().length
	status.cols = process.stdout.columns
	status.rows = 0
}

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


captureCursorPosition()


module.exports = {
    setPrompt,
    putPrompt,
    putCursor,
    getCursorPosition
}