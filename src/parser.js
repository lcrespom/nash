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

function parseArgument(pos, line) {
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
