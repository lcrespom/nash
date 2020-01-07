const { spawn } = require('child_process')
const keypress = require('keypress')

let child = null

function createShell() {
    //process.stdin.pause()
    let shell = '/bin/bash' //process.env.SHELL
    child = spawn(shell, ['-i'], [0, 'pipe', 'pipe'])
    child.stdout.on('data', buf => process.stdout.write(buf))
    child.stderr.on('data', buf => process.stderr.write(buf))
	child.on('close', code => {
		if (code != 0)
			process.stderr.write(`Error: exit code ${code}\n`);
		process.stdin.resume()
        process.exit(0)
	})
	child.on('error', err => {
		process.stderr.write(`nash: command failed: ${err}\n`)
        process.stdin.resume()
        process.exit(0)
    })
    child.stdin.write('ls\n')
    child.stdin.write('export PS1="\\n<)(>\\n"\n')
}


function listenKeyboard() {
	process.stdin.setRawMode(true)
	process.stdin.resume()
	keypress(process.stdin)
	process.stdin.on('keypress', handleKeypress)
}

function handleKeypress(ch, key) {
    if (ch) {
        process.stdout.write(ch)
        child.stdin.write(ch)
    }
}

listenKeyboard()
createShell()