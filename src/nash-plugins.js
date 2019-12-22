const {
	bindKey, setPrompt, getLastBinding
} = require('./editor')

function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}

module.exports = {
	setPrompt,
	bindKey,
	getLastBinding,
	setTerminalTitle
	// Others: syntax highlight, suggestions, tab-completion...
}
