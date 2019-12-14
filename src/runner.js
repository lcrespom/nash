const parser = require('./parser')
const { spawn, execFileSync } = require('child_process')

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
	let command = args[0].text
	let fullPath = which(command)
	if (!fullPath) {
		process.stderr.write(`nash: Unknown command '${command}'\n`)
		return
	}
	let cmdArgs = args.slice(1).map(arg => arg.text)
	//TODO (!!!!!)
	// - pipe: command | command
	// - redirect: command > filename
	// Maybe use shell option?
	process.stdin.pause()
	let child = spawn(fullPath, cmdArgs,
		{ stdio: 'inherit' }
		//{ stdio: ['pipe', 'inherit', 'inherit' ] }
	)
	child.on('close', (code) => {
		if (code != 0)
			process.stderr.write(`Error: exit code ${code}`);
		process.stdin.resume()
	})
	child.on('error', (err) => {
		process.stderr.write(`nash: could not execute '${command}': ${err}\n`)
		process.stdin.resume()
	})
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