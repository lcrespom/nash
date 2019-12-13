#!/usr/bin/env node
const fs = require('fs')

const print = console.log.bind(console)

function put(str) {
	process.stdout.write(str)
}

function prompt() {
	return 'nash> '
}

function unescape(buf) {
	let s = ''
	if (buf[0] == 27) {
		s = '\\'
		for (let i = 1; i < buf.length; i++)
			s +=  String.fromCharCode(buf[i])
	}
	else if (buf[0] < 27) {
		s = '^' + String.fromCharCode(buf[0] + 64)
	}
	else {
		s = String.fromCharCode(buf[0])
	}
	console.log(s)
}

function readline() {
	process.stdin.resume()
	process.stdin.setRawMode(true)
	process.stdin.on('data', function(buf) {
		console.dir(buf)
		unescape(buf)
		if (buf[0] == 3) process.exit()
	})
}

function checkInteractive() {
	if (process.stdout.isTTY) return
	print('Non interactive mode is not supported')
	process.exit(1)
}

function main() {
	checkInteractive()
	put(prompt())
	let line = readline()
}

main()
