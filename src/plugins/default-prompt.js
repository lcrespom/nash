const { gitStatus, gitStatusFlags } = require('./git-status')
const { setPrompt, setTerminalTitle } = require('../prompt')
const { getOption, setDefaultOptions } = require('../startup')
const { colorize } = require('../colors')
const { ucfirst } = require('../utils')


let colors
let promptConfig
const GIT_SYMBOL = '\ue0a0'

async function gitSection(isRemote) {
	let gstatus = await gitStatus(isRemote)
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

function segment(name, value) {
	if (!promptConfig['show' + ucfirst(name)]) return ''
	return colorize(colors[name], value)
}

async function prompt({ cwd, username, hostname, isRemote }) {
	let userAtHost = segment('user', username) + segment('at', '@')
	if (promptConfig.showHost) {
		let hostCol = isRemote ? colors.remoteHost : colors.host
		userAtHost += colorize(hostCol, hostname)
	}
	let path = ''
	if (promptConfig.showPath)
		path = colorize(colors.path, makePath(cwd))
	let git = '> '
	if (promptConfig.showGit)
		git = (await gitSection(isRemote)) || '> '
	return userAtHost + ' ' + path + git
}

function setDefaults() {
    let defaultColors = {
		user: 'magentaBright',
		at: 'cyanBright',
		host: 'greenBright',
		remoteHost: 'redBright',
        path: 'cyan',
        gitDirty: 'yellow',
        gitClean: 'green',
    }
    setDefaultOptions('colors.prompt', defaultColors)
	colors = getOption('colors.prompt')
	setDefaultOptions('prompt', {
		showUser: true,
		showAt: true,
		showHost: true,
		showPath: true,
		showGit: true,
		//parentDirMaxLen: 1,
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
