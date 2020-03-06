let runner
let runHiddenCommand, write


//------------------------- Inline JS -------------------------

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

async function runCommand(line, { pushDir = true } = {}) {
	let cmd = expandJS(line.trim())
	return runner.runCommand(cmd, pushDir)
}


//------------------------- Startup -------------------------

function getShellNameAndParams() {
	let shell = null
	for (let i = 2; i < process.argv.length; i++) {
		if (!process.argv[i].startsWith('-'))
			shell = process.argv[i]
	}
	shell = shell || process.env.SHELL || 'bash'
	params = shell.includes('bash') ? ['--rcfile', '~/.nash/nashrc'] : []
	return [shell, params]
}

function start() {
	let [shell, params] = getShellNameAndParams()
	runner.startShell(shell, params)
}

function loadRunner() {
	let spawn = false
	if (process.platform.includes('win32'))
		spawn = true
	for (let i = 2; i < process.argv.length; i++) {
		if (process.argv[i] == '--spawn')
			spawn = true
		else if (process.argv[i] == '--pty')
			spawn = false
	}
	if (spawn)
		return require('./spawn')
	else
		return require('./pty')
}

function setup() {
	runner = loadRunner()
	runHiddenCommand = runner.runHiddenCommand
	write = runner.write
}

setup()


module.exports = {
	runCommand,
	runHiddenCommand,
	write,
	start
}
