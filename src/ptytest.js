let os = require('os')

let pty = require('node-pty')
const keypress = require('keypress')


function launchShell() {
    let isWindows = os.platform() === 'win32'
    let shell = isWindows ? 'powershell.exe' : 'bash'
    let term = process.env.TERM || 'xterm-256color'
    let dir = process.cwd() || (isWindows ? process.env.USERPROFILE : process.env.HOME)
    let ptyProcess = pty.spawn(shell, [], {
        name: term,
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env
    })
    ptyProcess.onData(data => {
        let prompt = '\r\r\n<)(>\r\r\n'
        if (data.endsWith(prompt)) {
            data = data.substr(0, data.length - prompt.length) + '> '
        }
        process.stdout.write(data)
    })
    ptyProcess.onExit(evt => {
        console.log('Exited with code ' + evt.exitCode)
        ptyProcess.kill(evt.signal)
        process.exit(evt.exitCode)
    })
    process.stdout.on('resize', () => {
        ptyProcess.resize(process.stdout.columns, process.stdout.rows)
    })
    return ptyProcess
}

function listenKeyboard() {
	process.stdin.setRawMode(true)
	process.stdin.resume()
	keypress(process.stdin)
	process.stdin.on('keypress', handleKeypress)
}

function handleKeypress(ch, key) {
    if (!ptyProcess) return
    ptyProcess.write(ch ? ch : key.sequence)
}


let ptyProcess = launchShell()
ptyProcess.write('export PS1="\\n<)(>\\n"\n')
ptyProcess.write('ls -G\r')
listenKeyboard()
