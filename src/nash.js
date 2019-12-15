#!/usr/bin/env node
const keypress = require('keypress')

const editor = require('./editor')


function loadPlugin(pname) {
	require(pname)
}

function listenKeyboard() {
	process.stdin.setRawMode(true)
	process.stdin.resume()
	keypress(process.stdin)
	process.stdin.on('keypress', editor.handleKeypress)
}

function checkInteractive() {
	if (process.stdout.isTTY) return
	editor.print('Non interactive mode is not supported')
	process.exit(1)
}

function main() {
	loadPlugin('./plugins/key-bindings')
	loadPlugin('./plugins/prompt')
	checkInteractive()
	editor.putPrompt()
	listenKeyboard()
}

main()
