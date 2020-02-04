const { gitStatus, gitStatusFlags } = require('./git-status')
const { setPrompt, setTerminalTitle } = require('../prompt')
const { getOption, setDefaultOptions } = require('../startup')
const { colorize } = require('../colors')


let colors
let promptConfig
const GIT_SYMBOL = '\ue0a0'

function gitSection() {
	let gstatus = gitStatus()
	if (!gstatus) return ''
	let flags = gitStatusFlags(gstatus)
	if (flags) flags = ' ' + flags
	let gitColor = gstatus.dirty ? colors.gitDirty : colors.gitClean
	let status = ' (' + GIT_SYMBOL + ' ' + gstatus.branch + flags + ') '
	return colorize(gitColor, status)
}

function cutDirName(dirName, maxLength, ellipsis) {
	let suffixLen = ellipsis ? ellipsis.length : 0
	if (dirName.length <= maxLength + suffixLen)
		return dirName
	dirName = dirName.substr(0, maxLength)
	if (ellipsis)
		dirName += ellipsis
	return dirName
}

function makePath(cwd) {
	let dirs = cwd.split('/')
	let leafDir = dirs[dirs.length - 1]
	let maxLen = promptConfig.parentDirMaxLen
	let ellipsis = promptConfig.parentDirEllipsis
	if (maxLen) {
		dirs = dirs.map(
			d => d == leafDir ? d : cutDirName(d, maxLen, ellipsis)
		)
	}
	let maxDirs = promptConfig.maxDirs
	let prefix = promptConfig.maxDirEllipsis
	if (maxDirs && maxDirs < dirs.length) {
		dirs = dirs.slice(dirs.length - maxDirs, dirs.length)
		if (prefix)
			dirs = [prefix, ...dirs]
	}
	return dirs.join('/')
}

function prompt({ cwd, username, hostname, isRemote }) {
	let userAtHost = ''
	if (promptConfig.showUserAtHost)
		userAtHost = colorize(colors.userAtHost, username + '@' + hostname)
	let path = ''
	if (promptConfig.showDir)
		path = colorize(colors.path, makePath(cwd))
	let git = '> '
	//TODO update git-status plugin to run `git status` directly on bash
	if (promptConfig.showGit && !isRemote)
		git = gitSection() || '> '
	return userAtHost + ' ' + path + git
}

function setDefaults() {
    let defaultColors = {
		userAtHost: 'magentaBright',
        path: 'cyan',
        gitDirty: 'yellow',
        gitClean: 'green',
    }
    setDefaultOptions('colors.prompt', defaultColors)
	colors = getOption('colors.prompt')
	setDefaultOptions('prompt', {
		showUserAtHost: true,
		showDir: true,
		showGit: true,
		parentDirMaxLen: 1,
		//parentDirEllipsis: '\u2026',
		//maxDirs: 4,
		//maxDirEllipsis: '...'
	})
	promptConfig = getOption('prompt')
}


function start() {
	setDefaults()
	setPrompt(prompt)
	setTerminalTitle('Nash')
}


module.exports = { start }
