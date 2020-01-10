const { spawn } = require('child_process')
const os = require('os')
let pty = require('node-pty')

const parser = require('./parser')


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


//-------------------- Shell setup --------------------

let isWindows = os.platform() == 'win32'
let promptCB = null

function setPrompt(ptyProcess) {
	if (isWindows) {
		ptyProcess.write('function Prompt { "\\n<)(>\\n"}\n')
	}
	else {
		ptyProcess.write('export PS1="\\n<)(>\\n"\n\n')
	}	
}

function getShellName() {
	let shell = process.argv[2] || process.env.SHELL
	if (shell)
		return shell
	else
		return isWindows ? 'powershell.exe' : 'bash'
}

function startShell() {
    let shell = getShellName()
    let term = process.env.TERM || 'xterm-256color'
    let dir = process.cwd() || (isWindows ? process.env.USERPROFILE : process.env.HOME)
    let ptyProcess = pty.spawn(shell, [], {
        name: term,
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env
	})
	setPrompt(ptyProcess)
    process.stdout.on('resize', () => {
        ptyProcess.resize(process.stdout.columns, process.stdout.rows)
    })
    ptyProcess.onData(data => {
        let prompt = '\r\r\n<)(>\r\r\n'
        if (data.endsWith(prompt)) {
            data = data.substr(0, data.length - prompt.length)
			process.stdout.write(data)
			if (promptCB) promptCB()
			promptCB = null
        }
		else {
			process.stdout.write(data)
		}
    })
    ptyProcess.onExit(evt => {
        console.log('Exited with code ' + evt.exitCode)
        ptyProcess.kill(evt.signal)
        process.exit(evt.exitCode)
    })
	return ptyProcess
}

//-------------------- Running --------------------

function runTheCommand(args, cb) {
	let fullCommand = args
		.map(arg => arg.quote + arg.text + arg.quote)
		.join(' ')
	promptCB = cb
	// TODO hide the command, or it will appear twice
	ptyProcess.write(fullCommand + '\n')	// Write the command
	//TODO to support interactive programs,
	//	capture and write all keys until prompt appears back
}


function runCommand(line, cb = () => {}) {
	process.stdout.write('\n')
	// TODO simplify parser (and let syntax highlighter parse by itself)
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
	runCommand,
	isWindows
}