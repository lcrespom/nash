const { setPrompt } = require('../nash-plugins')


function prompt({ cwd, username, hostname }) {
	hostname = hostname.split('.')[0]
	return `${username}@${hostname} ${cwd}> `
}


setPrompt(prompt)
