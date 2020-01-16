/**
 * Removes the ANSI color codes from a given string
 * @param {string} str 
 */
function removeAnsiColorCodes(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Counts the number of common characters at the start of two strings
 * @param {string} str1 
 * @param {string} str2 
 */
function commonInitialChars(str1, str2) {
	let len = Math.min(str1.length, str2.length)
	let i
	for (i = 0; i < len; i++) {
		if (str1[i] !== str2[i]) break
	}
	return i
}

/**
 * Removes the last n chars of a string
 * @param {string} str the input string
 * @param {number} numch amount of chars to remove from end
 */
function cutLastChars(str, numch) {
    return str.substr(0, str.length - numch)
}


module.exports = {
    removeAnsiColorCodes,
    commonInitialChars,
    cutLastChars
}