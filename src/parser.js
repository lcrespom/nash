const ParamType = {
	text: 1,
	env: 2,
	javascript: 3
}

function isSeparator(ch) {
	return ch == ' ' || ch == '\t' || ch == '\n'
}

function isQuote(ch) {
	return ch == '"' || ch == "'"
}

function isJavaScript(pos, line) {
	return line.substr(pos, 2) == '$('
}

function skipSeparators(pos, line) {
	while (pos < line.length && isSeparator(line[pos])) {
		pos++
	}
	return pos
}

function parseArgument(pos, line) {
	let text = ''
	let type = null
	let quote = ''
	let openQuote = false
	if (isQuote(line[pos])) {
		quote = line[pos]
		pos++
		type = ParamType.text
		while (line[pos] != quote && pos < line.length) {
			text += line[pos]
			pos++
		}
		// Skip quote char
		if (line[pos] == quote) pos++
		else openQuote = true
	}
	else if (isJavaScript(pos, line)) {
		type = ParamType.javascript
		throw new Error('TBD')
	}
	else {
		while (pos < line.length && !isSeparator(line[pos])) {
			text += line[pos]
			pos++
		}
		type = text[0] == '$'
			? ParamType.env
			: ParamType.text
	}
	pos = skipSeparators(pos, line)
	return [pos, { type, text, quote, openQuote }]
}

function parseLine(line) {
	let arg = null, args = []
	let pos = skipSeparators(0, line)
	while (pos < line.length) {
		[pos, arg] = parseArgument(pos, line)
		args.push(arg)
	}
	return args
}

module.exports = {
	parseLine,
	ParamType
}
