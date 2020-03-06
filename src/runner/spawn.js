const childproc = require('child_process')

const { nashShutdown } = require('../startup')
const env = require('../env')

let shellName, shellParams
let status = null

function errorData(data) {
    data = data.toString()
    if (status == null) {
        if (data.startsWith('~@%'))
            status = data
        else
            process.stderr.write(data)
    }
    else {
        status += data
    }
}

function spawnBash(cmd) {
    let suffix = '; { __rc=$?; echo ~@%; hostname;whoami;pwd;echo $HOME;echo $__rc; } >&2'
    let args = shellParams.concat(['-i', '-c', cmd + suffix])
    return childproc.spawn(shellName, args, { stdio: ['inherit', 'inherit', 'pipe'] })
}

async function runCommand(cmd, { pushDir }) {
    process.stdout.write('\n')
    if (cmd == 'exit')
        return shutdown()
    status = null
    let spwn = spawnBash(cmd)
    spwn.on('error', err => console.log(`Got error: ${err}`))
    spwn.stderr.on('data', errorData)
    return new Promise(resolve => 
        spwn.on('exit', rc => {
            let ustatus = parseUserStatus(status)
            env.setUserStatus(ustatus)
            if (pushDir)
                dirHistory.push(ustatus.cwd)
            if (process.cwd() != ustatus.cwdfull)
                chdirOrWarn(ustatus.cwdfull)
            resolve()
        })
    )
}

function parseUserStatus(output) {
    let lines = output.split('\n')
        .slice(1)
		.map(l => l.trim())
		.filter(l => l.length > 0)
	return {
		hostname: lines[0],
		username: lines[1],
		cwd: lines[2],
		home: lines[3],
		retCode: lines[4]
	}
}

function chdirOrWarn(dir) {
	try {
        dir = dir.replace(/^\/([a-zA-Z])\//, '$1:\\')
            .replace(/\//g, '\\')
		env.chdir(dir)
	}
	catch (err) {
		process.stdout.write('\nWARNING: could not chdir to ' + dir + '\n')
	}
}

function write(txt) {
    throw new Exception('oops, spawn.write:' + txt)
	//ptyProcess.write(txt)
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
