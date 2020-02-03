const pty = require('node-pty')

const { nashShutdown } = require('./startup')
const { commonInitialChars } = require('./utils')
const { dirHistory } = require('./history')
const env = require('./env')

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
}

let promptCB = null
let theCommand = null
let grabOutput = false
let state = TermState.waitingCommand
let cmdOutput = ''

function hideCommand(data) {
	let cic = commonInitialChars(data, theCommand)
	if (cic > 0) {
		data = data.substr(cic)
		theCommand = theCommand.substr(cic)
		if (theCommand.length === 0) {
			state = TermState.runningCommand
			if (data.length > 0)
				dataFromShell(data)
		}
	}
	return data
}

function processCommandOutput(data) {
	if (grabOutput)
		cmdOutput += data
	else
		process.stdout.write(data)
}

function readCommandOutput(data) {
	if (data.endsWith(env.NASH_MARK)) {
		data = data.substr(0, data.length - env.NASH_MARK.length)
		processCommandOutput(data)
		state = TermState.waitingCommand
		promptCB()
	}
	else {
		processCommandOutput(data)
	}
}

function parseUserStatus(output) {
	let lines = output.split('\n')
		.map(l => l.trim())
		.filter(l => l.length > 0)
	return {
		hostname: lines[0],
		username: lines[1],
		cwd: lines[2],
		retCode: lines[3]
	}
}

function chdirOrWarn(dir) {
	try {
		env.chdir(dir)
	}
	catch (err) {
		process.stdout.write('\nWARNING: could not chdir to ' + dir + '\n')
	}
}

function dataFromShell(data) {
	switch (state) {
		case TermState.waitingCommand:
			return
		case TermState.readingCommand:
			return hideCommand(data)
		case TermState.runningCommand:
			return readCommandOutput(data)
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
	let dir = env.cwd() || process.env.HOME
	process.env.PS1 = env.NASH_MARK
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


//-------------------- Running --------------------

async function runCommandInternal(cmd) {
	return new Promise(resolve => {
		theCommand = cmd
		promptCB = resolve
		state = cmd.length > 0
			? TermState.readingCommand
			: TermState.runningCommand
		ptyProcess.write(theCommand + '\n')
	})
}

async function runHiddenCommand(cmd) {
	grabOutput = true
	cmdOutput = ''
	await runCommandInternal(` __rc=$?;${cmd};$(exit $__rc)`)
	return cmdOutput
}

async function runCommand(line) {
	env.refreshWhich()	// Clear which cache
	grabOutput = false
	let cmd = expandJS(line.trim())
	await runCommandInternal(cmd)
	let output = await runHiddenCommand('hostname;whoami;pwd;echo $__rc')
	let ustatus = parseUserStatus(output)
	if (env.cwd() != ustatus.cwd)
		chdirOrWarn(ustatus.cwd)
	ustatus.cwd = env.pathFromHome(ustatus.cwd)
	dirHistory.push(ustatus.cwd)
	env.setUserStatus(ustatus)
}


module.exports = {
	runCommand,
	runHiddenCommand,
	write,
	startShell
}
