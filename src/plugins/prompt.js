const os = require('os')

const { setPrompt } = require('../nash-plugins')


function prompt() {
	let cwd = process.cwd()
	let homedir = os.homedir()
	if (cwd.startsWith(homedir))
		cwd = '~' + cwd.substr(homedir.length)
	let uname = os.userInfo().username
	let hname = os.hostname().split('.')[0]
	return `${uname}@${hname} ${cwd}> `
}


setPrompt(prompt)
