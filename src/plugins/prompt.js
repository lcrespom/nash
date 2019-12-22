const chalk = require('chalk')

const { setPrompt, setTerminalTitle } = require('../nash-plugins')


function prompt({ cwd, username, hostname }) {
	return chalk.green(username + '@' + hostname) + ' ' + chalk.yellow(cwd) + '> '
}


setPrompt(prompt)
setTerminalTitle('Nash')