let keyBindings = {}
let lastBinding = null

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
	for (let key of knames) {
		if (!keyBindings[key])
			keyBindings[key] = []
		keyBindings[key].push({ code, desc })
	}
}

function unbindKey(kname, fname) {
	if (!keyBindings[kname]) return
	keyBindings[kname].filter(b => b.code.name != fname)
}

function getKeyBindings(kname) {
	return keyBindings[kname]
}

function getKeyBindingByFunction(fname) {
	let keys = getBoundKeys()
	for (let key of keys) {
		let bindings = getKeyBindings(key)
		if (!bindings) continue
		let b = bindings.find(b => b.code.name == fname)
		if (b) return b
	}
	return null
}

function getBoundKeys() {
	return Object.keys(keyBindings)
}

function getLastBinding() {
	return lastBinding
}

function setLastBinding(binding) {
	lastBinding = binding
}


module.exports = {
	bindKey,
	unbindKey,
	getKeyBindings,
	getKeyBindingByFunction,
    getLastBinding,
    setLastBinding,
	getBoundKeys
}
