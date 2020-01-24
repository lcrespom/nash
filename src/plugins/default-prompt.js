const { gitStatus, gitStatusFlags } = require('./git-status')
const { setPrompt, setTerminalTitle } = require('../prompt')
const { getOption, setDefaultOptions } = require('../startup')
const { colorize } = require('../colors')


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

function prompt({ cwd, username, hostname }) {
	let userAtHost = colorize(colors.userAtHost, username + '@' + hostname)
	let path = colorize(colors.path, cwd)
	let git = gitSection() || '> '
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
    return getOption('colors.prompt')
}

let colors = setDefaults()

setPrompt(prompt)
setTerminalTitle('Nash')
