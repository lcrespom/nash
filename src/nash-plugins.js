const { bindKey } = require('./editor')

function prompt() {
	return 'nash> '
}

module.exports = {
	prompt,
	bindKey
	// Others: syntax highlight, suggestions, tab-completion...
}
