const os = require('os')
const fs = require('fs')
const { execFileSync } = require('child_process')
const fastGlob = require('fast-glob')

const { memoize, removeAnsiCodes } = require('./utils')
const history = require('./history')


const NASH_MARK = '\x1E\x1E>'
let userStatus = null
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
	let wasRemote = userStatus ? userStatus.isRemote : false
	userStatus = ustat
	userStatus.fqdn = ustat.hostname
	userStatus.hostname = ustat.fqdn.split('.')[0]
	userStatus.cwdfull = ustat.cwd
	userStatus.cwd = pathFromHome(ustat.cwd)
	userStatus.isRemote = userStatus.fqdn != os.hostname()
	if (userStatus.isRemote != wasRemote) {
		history.initialize(userStatus.fqdn)
		if (userStatus.isRemote) initWhichRemote()
	}
}

function chdir(dir) {
	if (!getUserStatus().isRemote)
		process.chdir(dir)
}

function cwd() {
    return process.cwd()
}

function homedir() {
	return getUserStatus().home
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

function commandOut2Array(out) {
	let arr = removeAnsiCodes(out)
		.trim()
		.split('\n')
		.map(l => l.trim())
		.filter(l => l.length > 0)
	let rc = arr.pop()
	return rc === '0' ? arr : []
}

async function remoteGlob(paths) {
	if (!Array.isArray(paths))
		paths = [paths]
	let result = []
	for (let path of paths) {
		let command = `ls -p1d ${path}; echo $?`
		let out = await runHiddenCommand(command)
		result = result.concat(commandOut2Array(out))
	}
	return result
}

async function glob(paths, options) {
	if (getUserStatus().isRemote)
		return await remoteGlob(paths)
	else
		return fastGlob.sync(paths, options)
}


//------------------------- Which -------------------------

let whichLocal
let remoteCommands

function whichLocalSlow(command) {
	try {
		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
	}
	catch (e) {
		return null
	}
}

function refreshWhich() {
	whichLocal = memoize(whichLocalSlow)
}

function whichRemote(command) {
	if (!remoteCommands) return 'yes'
	return remoteCommands.has(command) ? 'yes' : ''
}

async function sleep(delay) {
	return new Promise(resolve => setTimeout(resolve, delay))
}

async function initWhichRemote() {
	await sleep(200)
	let path = await runHiddenCommand('echo $PATH')
	path = path.trim().replace(/:/g, ' ')
	let dircmd = `ls -1F ${path}; echo $?`
	await sleep(200)
	let out = await runHiddenCommand(dircmd)
	let dirs = commandOut2Array(out)
		.filter(l => l.match(/[*@]$/))
		.map(l => l.replace(/[*@]$/, ''))
	if (dirs.length > 0)
		remoteCommands = new Set(dirs)
	else
		remoteCommands = null
}


function which(command) {
	if (getUserStatus().isRemote)
		return whichRemote(command)
	else
		return whichLocal(command)
}


refreshWhich()


module.exports = {
    NASH_MARK,
	getUserStatus, setUserStatus,
	cwd, chdir, homedir, glob, pathFromHome,
	which, refreshWhich,
}
