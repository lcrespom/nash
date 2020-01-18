/**
 * Returns true if s1 starts with s2 in a case insensitive way.
 * @param {string} s1 The full string to be checked
 * @param {string} s2 The starting string
 */
function startsWithCaseInsensitive(s1, s2) {
    return s1.toLocaleLowerCase()
        .startsWith(s2.toLocaleLowerCase())
}

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

/**
 * Creates a cache for the results of a given function
 * @param {Function} func the function to memoize
 * @returns a new function that gets values from the cache when available
 */
function memoize(func) {
	var cache = {}
	return function () {
		var key = JSON.stringify(arguments)
		if (cache[key]) {
			return cache[key]
		}
		else {
			val = func.apply(null, arguments)
			cache[key] = val
			return val
		}
	}
}

module.exports = {
	startsWithCaseInsensitive,
    removeAnsiColorCodes,
    commonInitialChars,
	cutLastChars,
	memoize
}