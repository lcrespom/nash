#!/usr/bin/env node
const fs = require('fs')
const os = require('os')
const keypress = require('keypress')

const editor = require('./editor')


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

function main() {
	checkInteractive()
	loadPlugin('./plugins/key-bindings')
	loadPlugin('./plugins/prompt')
	loadNashRC()
	editor.putPrompt()
	listenKeyboard()
}

main()
