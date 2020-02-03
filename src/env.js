const os = require('os')
const fs = require('fs')
const { execFileSync } = require('child_process')
const fastglob = require('fast-glob')

const { memoize } = require('./utils')


const NASH_MARK = '\x1E\x1E>'
let userStatus = null


function initUserStatus() {
	let fqdn = os.hostname()
	return {
		cwd: pathFromHome(cwd(), homedir()),
		username: os.userInfo().username,
		hostname: fqdn.split('.')[0],
		fqdn,
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
}

function chdir(dir) {
	process.chdir(dir)
}

function cwd() {
    return process.cwd()
}

function homedir() {
	return os.homedir()
}

function listDirs(path) {
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

function glob(paths, options) {
	return fastglob.sync(paths, options)
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
