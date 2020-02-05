#!/usr/bin/env node
const keypress = require('keypress')

const editor = require('./editor')
const runner = require('./runner')
const startup = require('./startup')


function listenKeyboard() {
	process.stdin.setRawMode(true)
	process.stdin.resume()
	keypress(process.stdin)
	process.stdin.on('keypress', editor.handleKeypress)
}

function checkInteractive() {
	if (process.stdout.isTTY) return
	console.error('Non-interactive mode is not supported')
	process.exit(1)
}


function main() {
	checkInteractive()
	try {
		startup.nashStartup()
		editor.initialize()
		runner.startShell()
	}
	catch (err) {
		console.error(err.message)
		process.exit(2)
	}
	listenKeyboard()
}

main()
