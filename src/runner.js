let pty = require('node-pty')

const parser = require('./parser')

const NASH_MARK = '<)(>'

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
			// TODO do not execute command in case of JS error
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


//-------------------- Pseudo-terminal management --------------------

let promptCB = null
let theCommand = null

function getShellName() {
	return process.argv[2] || process.env.SHELL || 'bash'
}

function dataFromShell(data) {
	if (!theCommand) return
	let prompt = '\r\r\n' + NASH_MARK + '\r\r\n'
	if (data.endsWith(prompt)) {
		data = data.substr(0, data.length - prompt.length)
		process.stdout.write(data)
		if (promptCB) promptCB()
		promptCB = null
		theCommand = null
	}
	else {
		process.stdout.write(data)
	}
}

function startShell() {
    let shell = getShellName()
    let term = process.env.TERM || 'xterm-256color'
	let dir = process.cwd() || process.env.HOME
	// TODO maybe NASH prompt it should be shorter and invisible
	process.env.PS1 = '\\n' + NASH_MARK + '\\n'
    let ptyProcess = pty.spawn(shell, [], {
        name: term,
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env
	})
    process.stdout.on('resize', () => {
        ptyProcess.resize(process.stdout.columns, process.stdout.rows)
    })
    ptyProcess.onData(dataFromShell)
    ptyProcess.onExit(evt => {
        console.log('Exited with code ' + evt.exitCode)
        ptyProcess.kill(evt.signal)
        process.exit(evt.exitCode)
    })
	return ptyProcess
}

//-------------------- Running --------------------

function runTheCommand(args, cb) {
	theCommand = args
		.map(arg => arg.quote + arg.text + arg.quote)
		.join(' ')
	promptCB = cb
	// TODO hide the command, or it will appear twice
	ptyProcess.write(theCommand + '\n')	// Write the command
	//TODO to support interactive programs,
	//	capture and write all keys until prompt appears back
}


function runCommand(line, cb = () => {}) {
	// TODO simplify parser (and let syntax highlighter parse by itself)
	// TODO fix / adapt / remove all failing tests
	let args = parser.parseLine(line)
	if (args.length > 0) {
		args = expandArgs(args)
		runTheCommand(args, cb)
	}
	else {
		setTimeout(cb, 0)
	}
}


let ptyProcess = startShell()


module.exports = {
	runCommand
}