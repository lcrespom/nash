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

function commonInitialChars(str1, str2) {
	let len = Math.min(str1.length, str2.length)
	let i
	for (i = 0; i < len; i++) {
		if (str1[i] !== str2[i]) break
	}
	return i
}

function hideCommand(data) {
	if (theCommand === null || theCommand.length === 0) {
		return data
	}
	let cic = commonInitialChars(data, theCommand)
	if (cic > 0) {
		data = data.substr(cic)
		theCommand = theCommand.substr(cic)
	}	
	return data
}

function dataFromShell(data) {
	if (!promptCB) return
	data = hideCommand(data)
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		process.stdout.write(data)
		if (promptCB) promptCB()
		promptCB = null
	}
	else {
		process.stdout.write(data)
	}
}

function getShellName() {
	return process.argv[2] || process.env.SHELL || 'bash'
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

function runCommand(line, cb = () => {}) {
	line = expandJS(line.trim())
	theCommand = line
	promptCB = cb
	ptyProcess.write(theCommand + '\n')	// Write the command
}


let ptyProcess = startShell()


module.exports = {
	runCommand,
	write
}
