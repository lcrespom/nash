const ParamType = {
	unquoted: 1,
	env: 2,
	squoted: 3,
	dquoted: 4,
	javascript: 5
}

function isSeparator(ch) {
	return ch == ' ' || ch == '\t' || ch == '\n'
}

function skipSeparators(pos, line) {
	while (isSeparator(line[pos]) && pos < line.length) {
		pos++
	}
	return pos
}

function readWord(pos, line) {
	let word = ''
	pos = skipSeparators(pos, line)
	while (!isSeparator(line[pos]) && pos < line.length) {
		word += line[pos]
		pos++
	}
	pos = skipSeparators(pos, line)
	return [pos, word]
}

function readParam(pos, line) {
	let text = ''
	while (!isSeparator(line[pos]) && pos < line.length) {
		text += line[pos]
		pos++
	}
	pos = skipSeparators(pos, line)
	let prm = {
		type: ParamType.unquoted,
		text
	}
	return [pos, prm]
}

function parse(line) {
	let parsingCommand = true
	let pos = 0
	let command = null
	let param = null, params = []
	while (pos < line.length) {
		if (parsingCommand) {
			[pos, command] = readWord(pos, line)
			parsingCommand = false
		}
		else {
			[pos, param] = readParam(pos, line)
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
