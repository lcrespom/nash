const parser = require('./parser')
const { execFile, execFileSync } = require('child_process')

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

function expandArgs(args) {
	//TODO
	//  - Expand $env into values
	//	- Execute JS args and replace into returned text
	//  - Expand glob expressions into fond files
	return args
}

function isBuiltin(txt) {
	// Required builtin: `source`
	return false
}

function runBuiltin(args) {
	throw new Error('runBuiltin not yet implemented')
}

function which(command) {
	try {
		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
	}
	catch (e) {
		return null
	}
}

function runExternalCommand(args) {
	let fullPath = which(args[0].text)
	console.log(`full path: '${fullPath}'`)
	//process.stdout.write('TBD: runExternalCommand\n')
	// echo "Hello:" $0
	// sh -c 'ps -p $$ -o ppid=' | xargs ps -o comm= -p
	// , (e, out, err) => {
	// 	if (e) {
	// 		console.error(`execFile error: ${e}`);
	// 	}
	// 	else {
	// 		console.log(`stdout: ${out}`);
	// 		console.error(`stderr: ${err}`);
	// 	}
	// })
}

function runTheCommand(args) {
	if (isBuiltin(args[0].text)) {
		runBuiltin(args)
	}
	else {
		runExternalCommand(args)
	}
}

function runCommand(line) {
	let args = parser.parseLine(line)
	process.stdout.write('\n')
	if (args.length > 0) {
		args = expandArgs(args)
		runTheCommand(args)
	}
	//debugArgs(args)
	//TODO: get prompt from configuration
	process.stdout.write('nash > ')
}


module.exports = {
	runCommand
}