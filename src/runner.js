let pty = require('node-pty')

const NASH_MARK = '\x1E\x1E>'

//-------------------- Argument pre-processiong --------------------

let jsError = false

function runJS(jscode) {
	let context = process.env
	return function(txt) {
		try {
			return eval(txt)
		}
		catch (e) {
			console.error('Error evaluating JavaScript: ' + e)
			jsError = true
			return ''
		}
	}.call(context, jscode)
}

function expandJS(line) {
	jsError = false
	let replaced = line.replace(/\$\[([^\$]+)\$\]/g, (_, js) => runJS(js))
	if (jsError)
		return null
	else
		return replaced
}


//-------------------- Pseudo-terminal management --------------------

let promptCB = null
let theCommand = null

function getShellName() {
	return process.argv[2] || process.env.SHELL || 'bash'
}

function dataFromShell(data) {
	if (!theCommand) return
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		process.stdout.write(data)
		if (promptCB) promptCB()  // TODO collect output and pass it to cb
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
	process.env.PS1 = NASH_MARK
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

function write(txt) {
	ptyProcess.write(txt)
}

//-------------------- Running --------------------

function runTheCommand(line, cb) {
	theCommand = line
	promptCB = cb
	ptyProcess.write(theCommand + '\n')	// Write the command
}


function runCommand(line, cb = () => {}) {
	// TODO fix / adapt / remove all failing tests
	line = expandJS(line.trim())
	if (line) {
		runTheCommand(line, cb)
	}
	else {
		setTimeout(cb, 0)
	}
}


let ptyProcess = startShell()


module.exports = {
	runCommand,
	write
}