function removeLastChar(str) {
	return [
		str.charAt(str.length - 1),
		str.substring(0, str.length - 1)
	]
}

function removeFirstChar(str) {
	return [ str.charAt(0), str.substr(1) ]
}


function backwardDeleteChar(line) {
	if (line.left.length == 0) return line
	let [ch, left] = removeLastChar(line.left)
	return {
		left,
		right: line.right
	}
}

function backwardChar(line) {
	if (line.left.length == 0) return line
	let [ch, left] = removeLastChar(line.left)
	return {
		left,
		right: ch + line.right
	}
}

function forwardChar(line) {
	if (line.right.length == 0) return line
	let [ch, right] = removeFirstChar(line.right)
	return {
		left: line.left + ch,
		right
	}
}

function beginningOfLine(line) {
	return {
		left: '',
		right: line.left + line.right
	}
}

function endOfLine(line) {
	return {
		left: line.left + line.right,
		right: ''
	}
}

let defaultBindings = {
	backspace: backwardDeleteChar,
	left: backwardChar,
	right: forwardChar,
	home: beginningOfLine,
	end: endOfLine
}

let bindings = { ...defaultBindings }


module.exports = {
	defaultBindings,
	bindings
}
