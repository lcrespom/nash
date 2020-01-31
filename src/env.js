const os = require('os')
const { execFileSync } = require('child_process')
const { memoize } = require('./utils')


const NASH_MARK = '\x1E\x1E>'

function chdir(dir) {
	try {
		process.chdir(dir)
	}
	catch (err) {
		process.stdout.write('\nWARNING: could not chdir to ' + dir + '\n')
	}
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

function username() {
	return os.userInfo().username
}

function hostname() {
	return os.hostname()
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
    cwd,
	chdir,
	homedir,
	listDirs,
	pathFromHome,
	which,
	refreshWhich,
	username,
	hostname
}