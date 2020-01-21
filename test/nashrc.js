/*
This file is automcatically loaded during startup. It can be used to execute
any arbitrary JS code.
The exported plugin array is used to load configurable features. The are
all optional, other than `default-bindings`. Custom plugins can also be
loaded by using relative paths, e.g. './my-plugin'.
*/

module.exports = {
	plugins: [
		// Default keyboard commands - required
		'default-bindings',
		// Default propmt customization
		'default-prompt',
		// Tab-completion of command-line
		'completion',
		// Syntax highlighting
		'syntax-highlight',
		// Suggestion of previous command
		'suggestions'
	]
}
