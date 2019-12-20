const chalk = module.parent.require('chalk')

const { setPrompt } = module.parent.require('./nash-plugins')


const SEGMENT_SEPARATOR = '\ue0b0'

function prompt({ cwd, username, hostname }) {
	let context = chalk.black.bgCyan(` ${username}@${hostname} `)
	let sep1 = chalk.cyan.bgBlue(SEGMENT_SEPARATOR)
	let dir = chalk.white.bgBlue(` ${cwd} `)
	let sep2 = chalk.blue(SEGMENT_SEPARATOR)
	return context + sep1 + dir + sep2 + ' '
}


setPrompt(prompt)
