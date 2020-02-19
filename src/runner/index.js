let runner
let runCommand, runHiddenCommand, write

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
	let burst = false
	if (process.platform.includes('win32'))
		burst = true
	for (let i = 2; i < process.argv.length; i++) {
		if (process.argv[i] == '--burst')
			burst = true
		else if (process.argv[i] == '--flow')
			burst = false
	}
	if (burst)
		return require('./burst')
	else
		return require('./flow')
}

function setup() {
	runner = loadRunner()
	runCommand = runner.runCommand
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
