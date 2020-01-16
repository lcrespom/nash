#!/usr/bin/env node
const keypress = require('keypress')

const editor = require('./editor')
const history = require('./history')
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
	editor.print('Non-interactive mode is not supported')
	process.exit(1)
}


function main() {
	checkInteractive()
	startup.nashStartup()
	editor.putPrompt()
	history.load()
	runner.startShell()
	listenKeyboard()
}

main()
