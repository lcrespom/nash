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
			console.error('\nError evaluating JavaScript: ' + e)
			jsError = true
			return ''
		}
	}.call(context, jscode)
}

function expandJS(line) {
	jsError = false
	let replaced = line.replace(/\$\[([^\$]+)\$\]/g, (_, js) => runJS(js))
	if (jsError)
		return ''	// Do not execute command
	else
		return replaced
}


//-------------------- Terminal state machine --------------------

let TermState = {
	waitingCommand: 'waiting',
	readingCommand: 'reading',
	runningCommand: 'running',
	readingStatus: 'rstatus',
	capturingStatus: 'cstatus'
}

let promptCB = null
let theCommand = null
let state = TermState.waitingCommand

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
			state = state == TermState.readingCommand
				? TermState.runningCommand
				: TermState.capturingStatus
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
		state = TermState.readingStatus
		theCommand = 'id;hostname;pwd'
		ptyProcess.write(theCommand + '\n')		
	}
	else {
		process.stdout.write(data)
	}
}

function captureStatus(data) {
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		//process.stdout.write('<* ' + data + ' *>')	//TODO remove this
		// TODO userStatus += data, etc.
		promptCB()
		state = TermState.waitingCommand
	}
	else {
		//process.stdout.write('<* ' + data + ' *>')	//TODO remove this
		// TODO userStatus += data, etc.
	}
}

function dataFromShell(data) {
	switch (state) {
		case TermState.waitingCommand:
			return
		case TermState.readingCommand:
			return hideCommand(data)
		case TermState.runningCommand:
			return checkPromptAndWrite(data)
		case TermState.readingStatus:
			return hideCommand(data)
		case TermState.capturingStatus:
			return captureStatus(data)
	}
}


//-------------------- Pseudo-terminal management --------------------

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
	theCommand = expandJS(line.trim())
	promptCB = cb
	state = theCommand.length > 0
		? TermState.readingCommand
		: TermState.runningCommand
	ptyProcess.write(theCommand + '\n')
}


module.exports = {
	runCommand,
	write,
	startShell
}
