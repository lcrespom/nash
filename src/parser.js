const ParamType = {
	text: 1,
	env: 2,
	javascript: 3
}

function isSeparator(ch) {
	return ch == ' ' || ch == '\t' || ch == '\n'
}

function isQuoteStart(ch) {
	return ch == '"' || ch == "'"
}

function isQuoteEnd(pos, line, quote) {
	return line[pos] == quote &&
		line[pos - 1] != '\\'
}

function isJavaScriptStart(pos, line) {
	return line.substr(pos, 2) == '$('
}

function isJavaScriptEnd(pos, line) {
	return line.substr(pos, 2) == '$)'
}

function skipSeparators(pos, line) {
	while (pos < line.length && isSeparator(line[pos])) {
		pos++
	}
	return pos
}

function parseQuotedArgument(pos, line) {
	let arg = {
		quote: line[pos],
		text: '',
		type: ParamType.text,
		openQuote: false
	}
	pos++
	while (pos < line.length && !isQuoteEnd(pos, line, arg.quote)) {
		arg.text += line[pos]
		pos++
	}
	if (line[pos] == arg.quote) {
		pos++
	}
	else {
		arg.openQuote = true
	}
	return [pos, arg]
}

function parseUnquotedArgument(pos, line) {
	let arg = {
		quote: '',
		text: '',
		type: ParamType.text
	}
	while (pos < line.length && !isSeparator(line[pos])) {
		arg.text += line[pos]
		pos++
	}
	arg.type = arg.text[0] == '$'
		? ParamType.env
		: ParamType.text
	return [pos, arg]
}

function parseJavaScript(pos, line) {
	let arg = {
		quote: '$(',
		text: '',
		type: ParamType.javascript,
		openQuote: false
	}
	pos += 2
	while (pos < line.length && !isJavaScriptEnd(pos, line)) {
		arg.text += line[pos]
		pos++
	}
	if (isJavaScriptEnd(pos, line)) {
		pos += 2
	}
	else {
		arg.openQuote = true
	}
	return [pos, arg]
}

function parseArgument(pos, line) {
	let arg = null
	if (isQuoteStart(line[pos])) {
		[pos, arg] = parseQuotedArgument(pos, line)
	}
	else if (isJavaScriptStart(pos, line)) {
		[pos, arg] = parseJavaScript(pos, line)
	}
	else {
		[pos, arg] = parseUnquotedArgument(pos, line)
	}
	pos = skipSeparators(pos, line)
	return [pos, arg]
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
