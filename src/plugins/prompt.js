const { setPrompt } = require('../nash-plugins')


function prompt() {
	//TODO: user@host cwd >
	return process.cwd() + '> '
}


setPrompt(prompt)
