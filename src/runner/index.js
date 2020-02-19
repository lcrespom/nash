function getShellNameAndParams() {
	let shell = process.argv[2] || process.env.SHELL || 'bash'
	params = shell.includes('bash') ? ['--rcfile', '~/.nash/nashrc'] : []
	return [shell, params]
}

let runner
let runCommand, runHiddenCommand, write

function start() {
	let [shell, params] = getShellNameAndParams()
	runner.startShell(shell, params)
}

function setup() {
	runner = require('./flow')
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
