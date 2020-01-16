const fs = require('fs')
const os = require('os')


function getLsOptions() {
	if (process.platform === 'darwin') return '-G'
	else return '--color=auto'
}

function createRCFile() {
	const NASH_RC = `# nash init file

# Do NOT remove the line below, it is required for nash to work properly
PS1=$'\\x1E\\x1E>'

# Enable colors in ls command
alias ls="ls ${getLsOptions()}"
`
	let rcname = os.homedir() + '/.nash/nashrc'
	if (fs.existsSync(rcname)) return
	fs.writeFileSync(rcname, NASH_RC)
}

function createNashDirIfRequired() {
    let nashDir = os.homedir() + '/.nash'
    if (fs.existsSync(nashDir)) return
    fs.mkdirSync(nashDir)
    createRCFile()
}


function loadPlugin(pname) {
	require(pname)
}

function loadNashRC() {
	let rcname = os.homedir() + '/.nash/nashrc.js'
	if (!fs.existsSync(rcname)) return
	loadPlugin(rcname)
}


function nashStartup() {
    createNashDirIfRequired()
	loadPlugin('./plugins/key-bindings')
	loadPlugin('./plugins/prompt')
	loadPlugin('./plugins/completion')
	loadNashRC()
}

module.exports = {
    nashStartup
}