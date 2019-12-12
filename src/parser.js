const ParamType = {
	ERROR: 0,
	unquoted: 1,
	env: 2,
	squoted: 3,
	dquoted: 4,
	javascript: 5
}

function isSeparator(ch) {
	return ch == ' ' || ch == '\t' || ch == '\n'
}

function isQuote(ch) {
	return ch == '"' || ch == "'"
}

function skipSeparators(pos, line) {
	while (pos < line.length && isSeparator(line[pos])) {
		pos++
	}
	return pos
}

function parseWord(pos, line) {
	let word = ''
	pos = skipSeparators(pos, line)
	while (pos < line.length && !isSeparator(line[pos])) {
		word += line[pos]
		pos++
	}
	pos = skipSeparators(pos, line)
	return [pos, word]
}

function parseParam(pos, line) {
	let text = ''
	let type = ParamType.ERROR
	if (isQuote(line[pos])) {
		let quote = line[pos]
		pos++
		type = quote == '"'
			? ParamType.dquoted
			: ParamType.squoted
		while (line[pos] != quote && pos < line.length) {
			text += line[pos]
			pos++
		}
		// Skip quote char
		if (line[pos] == quote) pos++
	}
	else {
		type = ParamType.unquoted
		while (pos < line.length && !isSeparator(line[pos])) {
			text += line[pos]
			pos++
		}
	}
	pos = skipSeparators(pos, line)
	return [pos, { type, text }]
}

function parse(line) {
	let parsingCommand = true
	let pos = 0
	let command = null
	let param = null, params = []
	while (pos < line.length) {
		if (parsingCommand) {
			[pos, command] = parseWord(pos, line)
			parsingCommand = false
		}
		else {
			[pos, param] = parseParam(pos, line)
			params.push(param)
		}
	}
	return {
		command,
		params
	}
}

module.exports = {
	parse,
	ParamType
}
