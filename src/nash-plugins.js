const {
	bindKey, getLastBinding
} = require('./editor')
const { setPrompt, getCursorPosition } = require('./prompt')
const { runCommand } = require('./runner')

function setTerminalTitle(title) {
	process.stdout.write(`\x1b]0;${title}\x07`)
}

module.exports = {
	setPrompt,
	bindKey,
	getLastBinding,
	setTerminalTitle,
	getCursorPosition,
	runCommand
	// Others: syntax highlight, suggestions, tab-completion...
}
