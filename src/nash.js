#!/usr/bin/env node
const fs = require('fs')

const print = console.log.bind(console)

function put(str) {
	process.stdout.write(str)
}

function prompt() {
	return 'nash> '
}

function readline() {
	const BUF_SIZE = 8
	process.stdin.resume()
	process.stdin.setRawMode(true)
	process.stdin.on('data', function(buf) {
		console.dir(buf)
		console.log(buf.toString())
		if (buf[0] == 3) process.exit()
	})
}

function checkInteractive() {
	if (process.stdin.isTTY) return
	print('Non interactive mode is not supported')
}

function main() {
	checkInteractive()
	put(prompt())
	let line = readline()
}

main()
