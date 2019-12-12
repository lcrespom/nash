const ParseMode = {
	command: 1,
	param: 2,
	squotes: 3,
	dquotes: 4,
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

function parse(line) {
	let mode = ParseMode.command
	let pos = 0
	let command = null
	let param = null, params = []
	while (pos < line.length) {
		switch (mode) {
			case ParseMode.command:
				[pos, command] = readWord(pos, line)
				mode = ParseMode.param
				break
			case ParseMode.param:
				[pos, param] = readParam(pos, line)
				break
			default:
				throw new Error(`Unexpected parse mode: ${mode}`)
		}
	}
	return {
		command,
		params
	}
}

module.exports = {
	parse
}
