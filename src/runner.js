const { spawn } = require('child_process')

const parser = require('./parser')
const history = require('./history')


//-------------------- Argument pre-processiong --------------------

function runJS(jscode) {
	let context = process.env
	return function(txt) {
		try {
			return eval(txt)
		}
		catch (e) {
			console.error('Error evaluating JavaScript: ' + e)
			return ''
		}
	}.call(context, jscode);
}

function expandArgs(args) {
	for (let arg of args) {
		if (arg.type == parser.ParamType.javascript) {
			arg.quote = ''
			arg.text = runJS(arg.text)
		}
	}
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

function buildCommand(args) {
	return args
		.map(arg => arg.quote + arg.text + arg.quote)
		.join(' ')
}

function runExternalCommand(args, cb) {
	let fullCommand = buildCommand(args)
	process.stdin.pause()
	let captureOut = cb.length > 0
	let child = spawn(fullCommand, [], {
		// If 'inherit', child process I/O is automatically sent to parent
		stdio: captureOut ? undefined : 'inherit',
		// External shell is the real command interpreter
		shell: true
	})
	let outbuf = ''
	let errbuf = ''
	if (captureOut) {
		child.stdout.on('data', buf => outbuf += buf.toString())
		child.stderr.on('data', buf => errbuf += buf.toString())
	}
	child.on('close', (code) => {
		if (code != 0)
			process.stderr.write(`Error: exit code ${code}\n`);
		process.stdin.resume()
		cb(outbuf, errbuf)
	})
	child.on('error', (err) => {
		process.stderr.write(`nash: command failed: ${err}\n`)
		process.stdin.resume()
		cb(outbuf, errbuf)
	})
}

function runTheCommand(args, cb) {
	if (isBuiltin(args[0].text)) {
		runBuiltin(args)
		setTimeout(cb, 0)
	}
	else {
		runExternalCommand(args, cb)
	}
}

function runCommand(line, cb = () => {}) {
	process.stdout.write('\n')
	let args = parser.parseLine(line)
	if (args.length > 0) {
		history.push(line)
		args = expandArgs(args)
		runTheCommand(args, cb)
	}
	else {
		setTimeout(cb, 0)
	}
}


module.exports = {
	runCommand
}