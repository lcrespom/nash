const { spawn, execFileSync } = require('child_process')

const parser = require('./parser')
const editor = require('./editor')
const history = require('./history')


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
	//	- Execute JS args and replace into returned text
	return args
}

function isBuiltin(txt) {
	return txt == 'cd'
}

//TODO move builtins to a separate module
function builtin_cd(args) {
	if (args.length > 2) {
		console.error('nash: cd: too may arguments')
		return
	}
	if (args.length < 2) {
		// Do nothing
		return
	}
	let dir = args[1].text
	try {
		process.chdir(dir)
	}
	catch (err) {
		console.error(`nash: cd: could not cd to '${dir}': ${err}`)
	}
}

function runBuiltin(args) {
	let command = args[0].text
	if (command != 'cd')
		throw new Error(`Builtin '${command}' not yet implemented`)
	builtin_cd(args)
}


//-------------------- Running --------------------

function runExternalCommand(args, cb) {
	let command = args[0].text
	let cmdArgs = args.slice(1).map(arg => arg.text)
	process.stdin.pause()
	let child = spawn(command, cmdArgs, {
		stdio: 'inherit',	// Child process I/O is automatically sent to parent
		shell: true			// External shell is the real command interpreter
	})
	child.on('close', (code) => {
		if (code != 0)
			process.stderr.write(`Error: exit code ${code}\n`);
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

function runCommand(line, cb) {
	process.stdout.write('\n')
	let args = parser.parseLine(line)
	if (args.length > 0) {
		history.push(line)
		args = expandArgs(args)
		runTheCommand(args, () => {
			editor.putPrompt()
			if (cb) cb()
		})
	}
	else {
		editor.putPrompt()
		if (cb) cb()
	}
}


module.exports = {
	runCommand
}