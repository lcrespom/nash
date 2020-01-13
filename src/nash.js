#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const keypress = require('keypress')

const editor = require('./editor')
const history = require('./history')
const runner = require('./runner')


function loadPlugin(pname) {
	require(pname)
}

function loadNashRC() {
	let rcname = os.homedir() + '/.nashrc.js'
	if (!fs.existsSync(rcname)) return
	loadPlugin(rcname)
}

function listenKeyboard() {
	process.stdin.setRawMode(true)
	process.stdin.resume()
	keypress(process.stdin)
	process.stdin.on('keypress', editor.handleKeypress)
}

function checkInteractive() {
	if (process.stdout.isTTY) return
	editor.print('Non-interactive mode is not supported')
	process.exit(1)
}

function getLsOptions() {
	if (process.platform === 'darwin') return '-G'
	else return '--color=auto'
}

function createRCFileIfRequired() {
	const NASH_RC = `# nash init file

# Do NOT remove the line below, it is required for nash to work properly
PS1=$'\\x1E\\x1E>'

# Enable colors in ls command
alias ls="ls ${getLsOptions()}"`
	let rcname = os.homedir() + '/.nashrc'
	if (fs.existsSync(rcname)) return
	fs.writeFileSync(rcname, NASH_RC)
}

function main() {
	checkInteractive()
	createRCFileIfRequired()
	loadPlugin('./plugins/key-bindings')
	loadPlugin('./plugins/prompt')
	loadNashRC()
	editor.putPrompt()
	history.load()
	runner.startShell()
	listenKeyboard()
}

main()
