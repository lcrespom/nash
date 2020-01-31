/**
 * Returns the input string with its first character in uppercase
 * @param {string} str The input string
 * @returns the converted string
 */
function ucfirst(str) {
	if (str == '') return str
	return str.charAt(0).toUpperCase() + str.substr(1)
}

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
		if (cache[key] !== undefined) {
			return cache[key]
		}
		else {
			val = func.apply(null, arguments)
			cache[key] = val
			return val
		}
	}
}


/**
 * Removes repeated items from an array
 * @param {Array} arr the input array
 */
function removeRepeatedItems(arr) {
	return Array.from(new Set(arr))
}


/**
 * Extracts a nested property from an object
 * @param {object} obj the object to extract the property from
 * @param {string} name the property name, which may contain '.' to
 * 	express multiple levels of property nesting, just like the standard
 *  JS object notation.
 * @returns the property value, or undefined if the property is not present.
 */
function getProp(obj, name) {
	let names = name.split('.')
	for (let n of names) {
		obj = obj[n]
		if (obj === undefined) return obj
	}
	return obj
}

/**
 * Sets the value to a nested property of an object.
 * @param {object} obj the object to update
 * @param {string} name the property name, which may contain '.' to
 * 	express multiple levels of property nesting, just like the standard
 *  JS object notation. If a property at any level does not exist, it is
 *  created.
 */
function setProp(obj, name, value) {
	let names = name.split('.')
	let pname = names.pop()
	for (let n of names) {
		if (obj[n] === undefined) obj[n] = {}
		obj = obj[n]
	}
	obj[pname] = value
}

/**
 * Returns an object where property names become values and vice-versa.
 * For example:
 *   reverseObject({ foo: 'bar', x: 3 }) returns { bar: 'foo', '3': x }
 * @param {object} obj The target object
 * @returns the reversed object
 */
function reverseObject(obj) {
	return Object.keys(obj).reduce((a, k) => (a[obj[k]] = k, a), {})
}


module.exports = {
	ucfirst,
	startsWithCaseInsensitive,
	removeAnsiColorCodes,
	substrWithColors,
    commonInitialChars,
	cutLastChars,
	memoize,
	removeRepeatedItems,
	getProp,
	setProp,
	reverseObject
}
