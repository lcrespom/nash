const {
	bindKey, setPrompt, getLastBinding, clearCommand
} = require('./editor')
const { runCommand } = require('./runner')

function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}

module.exports = {
	setPrompt,
	bindKey,
	getLastBinding,
	clearCommand,
	setTerminalTitle,
	runCommand
	// Others: syntax highlight, suggestions, tab-completion...
}
