/**
 * NOTICE: this prompt plugin requires that the terminal is configured
 *   with a font that supports the special characters used to display it.
 * 
 * 	 A good source of such fonts is the
 * 	 [Powerline](https://github.com/powerline/fonts) GitHub page.
 */

const chalk = require(NODE_MODULES + '/chalk')

const { setPrompt } = require(NASH_BASE + '/prompt')
const { setTerminalTitle } = require(NASH_BASE + '/terminal')
const { gitStatus, gitStatusFlags } = require(NASH_BASE + '/plugins/git-status')


const SEGMENT_SEPARATOR = '\ue0b0'
const GIT_SYMBOL = '\ue0a0'

function err(retCode) {
	if (retCode == 0)
		return ''
	return ` (${retCode})`
}

function gitSection() {
	let gstatus = gitStatus()
	if (!gstatus)
		return chalk.blue(SEGMENT_SEPARATOR)
	let flags = gitStatusFlags(gstatus)
	// if (flags == '') flags = '✔'
	let fgcolor = gstatus.dirty ? 'yellow' : 'green'
	let bgcolor = gstatus.dirty ? 'bgYellow' : 'bgGreen'
	let sep1 = chalk.blue[bgcolor](SEGMENT_SEPARATOR)
	let status = ' ' + GIT_SYMBOL + ' ' + gstatus.branch + ' ' + flags + ' '
	let sep2 = chalk[fgcolor](SEGMENT_SEPARATOR)
	return sep1 + chalk.black[bgcolor](status) + sep2
}

function prompt({ cwd, username, hostname, retCode }) {
	let ctx = chalk.black.bgCyan(` ${username}@${hostname} `)
	let ss1 = chalk.cyan.bgBlue(SEGMENT_SEPARATOR)
	let dir = chalk.white.bgBlue(` ${cwd} `)
	let nsh = chalk.white.bgMagenta(err(retCode) + ' nash ')
	let ss3 = chalk.magenta(SEGMENT_SEPARATOR)
	return ctx + ss1 + dir + gitSection() + '\n' + nsh + ss3 + ' '
}


setPrompt(prompt)
setTerminalTitle('Nash')
