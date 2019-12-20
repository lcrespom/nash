const chalk = module.parent.require('chalk')

const { setPrompt } = module.parent.require('./nash-plugins')


const SEGMENT_SEPARATOR = '\ue0b0'

function prompt({ cwd, username, hostname }) {
	let nsh = chalk.white.bgMagenta(' nash ')
	let ss1 = chalk.magenta.bgCyan(SEGMENT_SEPARATOR)
	let ctx = chalk.black.bgCyan(` ${username}@${hostname} `)
	let ss2 = chalk.cyan.bgBlue(SEGMENT_SEPARATOR)
	let dir = chalk.white.bgBlue(` ${cwd} `)
	let ss3 = chalk.blue(SEGMENT_SEPARATOR)
	return nsh + ss1 + ctx + ss2 + dir + ss3 + ' '
}


setPrompt(prompt)
