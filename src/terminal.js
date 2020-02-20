function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}

/**
 * Removes the ANSI color codes from a given string
 * @param {string} str 
 */
function removeAnsiColorCodes(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Removes any ANSI terminal codes from a given string
 * @param {string} str 
 */
function removeAnsiCodes(str) {
	return str.replace(/\x1b\[[0-9:;<=>\?]*[A-Za-z]/g, '')
}

/**
 * Cuts a substring from a string that potentially contains ANSI
 * color commands, preserving the visible length.
 * @param {string} str the input string
 * @param {number} from the starting position
 * @param {number} len the number of characters to include
 */
function substrWithColors(str, from, len) {
	if (!str || len <= 0) return ''
	let result = ''
	let pos = 0
	let l = 0
	let ansi = false
	for (let i = 0; i < str.length; i++) {
		if (ansi) {
			result += str.charAt(i)
			if (str.charCodeAt(i) >= 0x40)
				ansi = false
		}
		else {
			if (str.substr(i, 2) == '\x1b[') {
				ansi = true
				result += '\x1b['
				i++
			}
			else {
				if (pos >= from && l < len) {
					result += str.charAt(i)
					l++
				}
				pos++
			}
		}
	}
	return result
}


module.exports = {
    setTerminalTitle,
    removeAnsiColorCodes,
	removeAnsiCodes,
    substrWithColors,
    NORMAL: '\x1b[0m',
    INVERSE: '\x1b[7m',
    WHITE: '\x1b[97m',
    HIDE_CURSOR: '\x1b[?25l',
    SHOW_CURSOR: '\x1b[?25h',
    HIDE_TEXT: '\x1b[30m',
    SHOW_TEXT: '\x1b[0m',
    GET_CURSOR_POS: '\x1b[6n'
}