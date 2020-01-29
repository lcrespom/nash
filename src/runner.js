const os = require('os')
const pty = require('node-pty')
const { execFileSync } = require('child_process')

const { nashShutdown } = require('./startup')
const { commonInitialChars, fromHomedir, memoize } = require('./utils')
const { dirHistory } = require('./history')

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
let userStatus = ''

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
		// Invalid state...
		process.stdout.write(data)
	}
	return data
}

function checkPromptAndWrite(data) {
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		process.stdout.write(data)
		state = TermState.readingStatus
		theCommand = ' __rc=$?;whoami;pwd;echo $__rc;$(exit $__rc)'
		userStatus = ''
		ptyProcess.write(theCommand + '\n')		
	}
	else {
		process.stdout.write(data)
	}
}

function parseUserStatus() {
	let lines = userStatus.split('\n')
		.map(l => l.trim())
		.filter(l => l.length > 0)
	return {
		username: lines[0],
		cwd: lines[1],
		retCode: lines[2]
	}
}

function captureStatus(data) {
	if (data.endsWith(NASH_MARK)) {
		data = data.substr(0, data.length - NASH_MARK.length)
		userStatus += data
		let ustatus = parseUserStatus()
		if (process.cwd() != ustatus.cwd)
			try { process.chdir(ustatus.cwd) } catch (err) {}
		ustatus.cwd = fromHomedir(ustatus.cwd, os.homedir())
		dirHistory.push(ustatus.cwd)
		promptCB(ustatus)
		state = TermState.waitingCommand
	}
	else {
		userStatus += data
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
	params = shell.includes('bash') ? ['--rcfile', '~/.nash/nashrc'] : []
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
		nashShutdown()
        process.exit(0)
    })
}

function write(txt) {
	ptyProcess.write(txt)
}

function whichSlow(command) {
	try {
		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
	}
	catch (e) {
		return null
	}
}

let which = memoize(whichSlow)

//-------------------- Running --------------------

function runCommand(line, cb = () => {}) {
	// Clear which cache: after a command, path and commands may have changed
	//which = memoize(whichSlow)
	theCommand = expandJS(line.trim())
	promptCB = cb
	state = theCommand.length > 0
		? TermState.readingCommand
		: TermState.runningCommand
	ptyProcess.write(theCommand + '\n')
}


module.exports = {
	runCommand,
	which,
	write,
	startShell
}
