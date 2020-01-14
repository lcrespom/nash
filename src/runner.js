let pty = require('node-pty')

const NASH_MARK = '\x1E\x1E>'
let ptyProcess = null

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


//-------------------- Terminal state machine --------------------

let TermStatus = {
	waitingCommand: 'waiting',
	readingCommand: 'reading',
	runningCommand: 'running',
	readingStatus: 'rstatus',
	capturingStatus: 'cstatus'
}

let promptCB = null
let theCommand = null
let status = TermStatus.waitingCommand


//-------------------- Pseudo-terminal management --------------------

function commonInitialChars(str1, str2) {
	let len = Math.min(str1.length, str2.length)
	let i
	for (i = 0; i < len; i++) {
		if (str1[i] !== str2[i]) break
	}
	return i
}

function hideCommand(data) {
	let cic = commonInitialChars(data, theCommand)
	if (cic > 0) {
		data = data.substr(cic)
		theCommand = theCommand.substr(cic)
		if (theCommand.length === 0) {
			// status = status == TermStatus.readingCommand
			// 	? TermStatus.runningCommand
			// 	: TermStatus.capturingStatus
			status = TermStatus.runningCommand
			if (data.length > 0)
				dataFromShell(data)
		}
	}
	else {
		console.dir('Invalid state:', data)
	}
	return data
}

function checkPromptAndWrite(data) {
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		process.stdout.write(data)
		promptCB()
		status = TermStatus.waitingCommand
	}
	else {
		process.stdout.write(data)
	}
}

function dataFromShell(data) {
	switch (status) {
		case TermStatus.waitingCommand:
			return
		case TermStatus.readingCommand:
			return hideCommand(data)
		case TermStatus.runningCommand:
			return checkPromptAndWrite(data)
/*		case TermStatus.readingStatus:
			return hideCommand(data)// **** but newStatus will be capturingStatus
		case TermStatus.capturingStatus:
			return captureStatus(data)*/
	}
	// if (!promptCB) return
	// data = hideCommand(data)
	// if (data.endsWith(NASH_MARK)) {
	// 	data = data.substr(0, data.length - NASH_MARK.length)
	// 	process.stdout.write(data)
	// 	if (promptCB) promptCB()
	// 	promptCB = null
	// }
	// else {
	// 	process.stdout.write(data)
	// }
}

function getShellNameAndParams() {
	let shell = process.argv[2] || process.env.SHELL || 'bash'
	params = shell.includes('bash') ? ['--rcfile', '~/.nashrc'] : []
	return [shell, params]
}

function startShell() {
    let [shell, params] = getShellNameAndParams()
    let term = process.env.TERM || 'xterm-256color'
	let dir = process.cwd() || process.env.HOME
	process.env.PS1 = NASH_MARK
    ptyProcess = pty.spawn(shell, params, {
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
        ptyProcess.kill(evt.signal)
        process.exit(0)
    })
}

function write(txt) {
	ptyProcess.write(txt)
}

//-------------------- Running --------------------

function runCommand(line, cb = () => {}) {
	line = expandJS(line.trim())
	theCommand = line
	promptCB = cb
	status = TermStatus.readingCommand
	ptyProcess.write(theCommand + '\n')	// Write the command
}


module.exports = {
	runCommand,
	write,
	startShell
}
