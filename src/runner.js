const { spawn } = require('child_process')
const fs = require('fs')

const parser = require('./parser')
const history = require('./history')
const builtins = require('./builtins')


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
	if (args[0].type == parser.ParamType.text) {
		//TODO delegate on external shell interpreter
		let alias = builtins.getAlias(args[0].text)
		if (alias)
			args[0].text = alias
	}
	for (let arg of args) {
		if (arg.type == parser.ParamType.javascript) {
			arg.quote = ''
			arg.text = runJS(arg.text)
		}
	}
	return args
}


//-------------------- Running --------------------

function buildCommand(args) {
	return args
		.map(arg => arg.quote + arg.text + arg.quote)
		.join(' ')
}

function getShell() {
	let shell = process.env.SHELL
	if (shell && fs.existsSync(shell))
		return shell
	else
		return true
}

function runExternalCommand(args, cb) {
	let fullCommand = buildCommand(args)
	process.stdin.pause()
	let captureOut = cb.length > 0
	let child = spawn(fullCommand, [], {
		// If 'inherit', child process I/O is automatically sent to parent
		stdio: captureOut ? undefined : 'inherit',
		// External shell is the real command interpreter
		shell: getShell()
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
	if (builtins.isBuiltin(args[0].text)) {
		builtins.runBuiltin(args)
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