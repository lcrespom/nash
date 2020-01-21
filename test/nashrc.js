/**
 * This is an example of a "plugin" file, where the user customizes nash
 * using the API provided by `nash`.
 * 
 * It will be automatically executed by nash upon startup, if placed in
 * `~/.nash/nashrc.js`.
 * 
 * Notice that for executing standard shell commands during startup
 * (e.g. for setting up aliases, $PATH, etc.), the equivalent file
 * `~/.nash/nashrc` should be used.
 */


const chalk = module.parent.require('chalk')

const { setPrompt } = module.parent.require('./prompt')


const SEGMENT_SEPARATOR = '\ue0b0'

function prompt({ cwd, username, hostname }) {
	let ctx = chalk.black.bgCyan(` ${username}@${hostname} `)
	let ss1 = chalk.cyan.bgBlue(SEGMENT_SEPARATOR)
	let dir = chalk.white.bgBlue(` ${cwd} `)
	let ss2 = chalk.blue(SEGMENT_SEPARATOR)
	let nsh = chalk.white.bgMagenta(' nash ')
	let ss3 = chalk.magenta(SEGMENT_SEPARATOR)
	return ctx + ss1 + dir + ss2 + '\n' + nsh + ss3 + ' '
}


setPrompt(prompt)
