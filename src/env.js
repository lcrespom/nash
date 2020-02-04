const os = require('os')
const fs = require('fs')
const { execFileSync } = require('child_process')
const fastglob = require('fast-glob')

const { memoize, removeAnsiCodes } = require('./utils')


const NASH_MARK = '\x1E\x1E>'
let userStatus = null
let isRemote = false
let runnerRHC = undefined


function runHiddenCommand(cmd) {
	if (!runnerRHC)
		runnerRHC = require('./runner').runHiddenCommand
	return runnerRHC(cmd)
}

function initUserStatus() {
	let fqdn = os.hostname()
	return {
		cwd: pathFromHome(cwd(), os.homedir()),
		username: os.userInfo().username,
		hostname: fqdn.split('.')[0],
		fqdn,
		home: os.homedir(),
		retCode: 0
	}
}

function getUserStatus() {
	if (!userStatus)
		userStatus = initUserStatus()
	return userStatus
}

function setUserStatus(ustat) {
	userStatus = ustat
	userStatus.fqdn = ustat.hostname
	userStatus.hostname = ustat.fqdn.split('.')[0]
	isRemote = userStatus.fqdn != os.hostname()
}

function chdir(dir) {
	if (!isRemote)
		process.chdir(dir)
}

function cwd() {
    return process.cwd()
}

function homedir() {
	return getUserStatus().home
}

function listDirs(path) {
	//TODO delegate on glob
	return fs.readdirSync(path, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
}

/**
 * If an absolute path is inside the user's home directory, shortens
 * the path by replacing the home directory with '~'
 * @param {string} cwd the absolute path
 * @param {string} home optional - the user's home directory
 */
function pathFromHome(cwd, home) {
	if (!home) home = homedir()
	if (cwd.startsWith(home))
		cwd = '~' + cwd.substr(home.length)
	return cwd
}

async function glob(paths, options) {
	if (isRemote) {
		//TODO paths can be an array
		let command = `ls -p1d ${paths}; echo $?`
		let out = await runHiddenCommand(command)
		let files = removeAnsiCodes(out)
			.split('\n')
			.map(l => l.trim())
			.filter(l => l.length > 0)
		let rc = files.pop()
		return rc === '0' ? files : []
	}
	else return await fastglob(paths, options)
}

function whichSlow(command) {
	try {
		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
	}
	catch (e) {
		return null
	}
}

let which

function refreshWhich() {
	which = memoize(whichSlow)
}

refreshWhich()

//TODO implement process.env...
//function getEnvVar(name) {}

module.exports = {
    NASH_MARK,
	getUserStatus, setUserStatus,
	cwd, chdir, homedir, glob, listDirs, pathFromHome,
	which, refreshWhich,
}
