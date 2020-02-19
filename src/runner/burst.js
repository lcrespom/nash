const childproc = require('child_process')
const pty = require('node-pty')


let shellName


async function runCommand(line, { pushDir }) {
}

async function runHiddenCommand(cmd) {
    // No need to open a pseudo-terminal
    return new Promise((resolve, reject) => {
        let args = ['-c', cmd]
        childproc.execFile(shellName, args, (error, stdout, stderr) => {
            if (error)
                reject(error)
            else
                resolve(stderr.toString() + stdout.toString())
        })
    })
}

function startShell(shell, params) {
    shellName = shell
}

module.exports = {
	runCommand,
	runHiddenCommand,
	write,
	startShell
}
