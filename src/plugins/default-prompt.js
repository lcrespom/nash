const chalk = require('chalk')

const { gitStatus, gitStatusFlags } = require('./git-status')
const { setPrompt, setTerminalTitle } = require('../prompt')


const GIT_SYMBOL = '\ue0a0'

function gitSection() {
	let gstatus = gitStatus()
	if (!gstatus) return ''
	let flags = gitStatusFlags(gstatus)
	if (flags) flags = ' ' + flags
	let fgcolor = gstatus.dirty ? 'yellow' : 'green'
	let status = ' (' + GIT_SYMBOL + ' ' + gstatus.branch + flags + ') '
	return chalk[fgcolor](status)
}

function prompt({ cwd, username, hostname }) {
	let userAtHost = chalk.magentaBright(username + '@' + hostname)
	let path = chalk.cyan(cwd)
	let git = gitSection() || '> '
	return userAtHost + ' ' + path + git
}


setPrompt(prompt)
setTerminalTitle('Nash')
