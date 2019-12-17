const chalk = require('chalk')

const { setPrompt } = require('../nash-plugins')


function prompt({ cwd, username, hostname }) {
	return `${username}@${hostname} ${cwd}> `
	//TODO compute visible length
	//return chalk.green(username + '@' + hostname) + ' ' + chalk.yellow(cwd) + '> '
}


setPrompt(prompt)
