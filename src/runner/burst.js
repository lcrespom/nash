const childproc = require('child_process')
const pty = require('node-pty')

const { nashShutdown } = require('../startup')
const env = require('../env')

let shellName, shellParams
let ptyProcess = null
let pos = 0


//-------------------- PTY --------------------

function toHex(str) {
    let hex = str.split('')
        .map(ch => ch < ' '
            ? '<' + ch.charCodeAt(0).toString(16) + '>'
            : ch
        )
        .join('')
    return hex + '\n---\n'
}

function clearEscapes(data) {
    return data
        .replace('\x1b[2J', '')
        .replace('\x1b[H', '')
}

function dataFromShell(data) {
    // process.stdout.write(toHex(data))
    // Skip initial clear screen
    if (pos == 0) data = clearEscapes(data)
    process.stdout.write(data)
    pos += data.length
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
    let args = shellParams.concat(['-i', '-c', cmd])
    return pty.spawn(shellName, args, {
        name: term,
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env
	})
}

function resizePTY() {
    ptyProcess.resize(process.stdout.columns, process.stdout.rows)
}

async function runCommand(cmd, { pushDir }) {
    process.stdout.write('\n')
    if (cmd == 'exit')
        return shutdown()
    pos = 0
    ptyProcess = createPTY(cmd)
    process.stdout.on('resize', resizePTY)
    ptyProcess.onData(dataFromShell)
    return new Promise(resolve => 
        ptyProcess.onExit(evt => {
            ptyProcess.kill(evt.signal)
            process.stdout.off('resize', resizePTY)
            ptyProcess = null
            resolve()
        })
    )
}

function write(txt) {
	ptyProcess.write(txt)
}


//-------------------- Other non-pty stuff --------------------

function shutdown() {
    nashShutdown()
    process.exit(0)
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
    shellParams = params
}


module.exports = {
	runCommand,
    runHiddenCommand,
    write,
	startShell
}
