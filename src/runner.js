const parser = require('./parser')


function typeName(type) {
	for (let k of Object.keys(parser.ParamType)) {
		if (parser.ParamType[k] === type) return k
	}
	return `Unknown (${type})`
}

function debugArgs(args) {
	for (let arg of args) {
		let tname = typeName(arg.type)
		let qtext = arg.quote + arg.text +
			(arg.openQuote ? ' [open quote]': arg.quote)
		// TODO: closequote
		console.log(`${tname}: ${qtext}`)
	}
}

function runCommand(line) {
	let args = parser.parseLine(line)
	process.stdout.write('\n')
	debugArgs(args)
	//TODO: show prompt
}


module.exports = {
	runCommand
}