const { spawn, execFileSync } = require('child_process')

const parser = require('./parser')
const editor = require('./editor')


//-------------------- Debugging --------------------

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


//-------------------- Argument pre-processiong --------------------

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

// function which(command) {
// 	try {
// 		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
// 	}
// 	catch (e) {
// 		return null
// 	}
// }

//-------------------- Running --------------------

let running = false
let runCompleteListener = undefined

function runExternalCommand(args, cb) {
	let command = args[0].text
	// let fullPath = which(command)
	// if (!fullPath) {
	// 	process.stderr.write(`nash: Unknown command '${command}'\n`)
	// 	return
	// }
	let cmdArgs = args.slice(1).map(arg => arg.text)
	process.stdin.pause()
	let child = spawn(command, cmdArgs, {
		stdio: 'inherit',	// Child process I/O is automatically sent to parent
		shell: true			// Shell handles environment, pipe, redirection, etc.
		//TODO: eventually, `shell: true` will not be used, and nash should support
		//	pipes, redirection, environment variables, glob expansion, builtins, etc etc.

	})
	child.on('close', (code) => {
		if (code != 0)
			process.stderr.write(`Error: exit code ${code}`);
		process.stdin.resume()
		cb()
	})
	child.on('error', (err) => {
		process.stderr.write(`nash: could not execute '${command}': ${err}\n`)
		process.stdin.resume()
		cb()
	})
}

function runTheCommand(args, cb) {
	if (isBuiltin(args[0].text)) {
		runBuiltin(args)
		cb()
	}
	else {
		runExternalCommand(args, cb)
	}
}

function runCommand(line) {
	process.stdout.write('\n')
	let args = parser.parseLine(line)
	if (args.length > 0) {
		args = expandArgs(args)
		running = true
		runTheCommand(args, () => {
			editor.putPrompt()
			running = false
			if (runCompleteListener) {
				runCompleteListener()
				runCompleteListener = undefined
			}
		})
	}
}

function waitForRunner(cb) {
	if (!running) cb()
	else runCompleteListener = cb
}


module.exports = {
	runCommand,
	waitForRunner
}