const childproc = require('child_process')
const pty = require('node-pty')

const env = require('../env')

let shellName
let ptyProcess = null


//-------------------- PTY --------------------

function dataFromShell(data) {
    process.stdout.write(data)
    // TODO detect and grab user status
    // let statusCmd = "__rc=$?;echo $'\x1E\x1E>';" +
    //     'hostname;whoami;pwd;echo $HOME;echo $__rc;$(exit $__rc)'
	// let output = await runHiddenCommand(statusCmd)
	// let ustatus = parseUserStatus(output)
	// env.setUserStatus(ustatus)
	// if (pushDir)
	// 	dirHistory.push(ustatus.cwd)
	// if (process.cwd() != ustatus.cwdfull)
	// 	chdirOrWarn(ustatus.cwdfull)
}

function createPTY(cmd) {
    let term = process.env.TERM || 'xterm-256color'
	let dir = process.cwd() || process.env.HOME
    process.env.PS1 = env.NASH_MARK
    let args = ['-c', cmd]
    return pty.spawn(shellName, args, {
        name: term,
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env
	})
}

async function runCommand(cmd, { pushDir }) {
    process.stdout.write('\n')
    ptyProcess = createPTY(cmd)
    process.stdout.on('resize', () => {
        ptyProcess.resize(process.stdout.columns, process.stdout.rows)
    })
    ptyProcess.onData(dataFromShell)
    return new Promise(resolve => 
        ptyProcess.onExit(evt => {
            ptyProcess.kill(evt.signal)
            ptyProcess = null
            resolve()
        })
    )
}

function write(txt) {
	ptyProcess.write(txt)
}


//-------------------- Other non-pty stuff --------------------

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
