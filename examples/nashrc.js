/*
This file is automcatically loaded during startup. It can be used to execute
any arbitrary JS code.

The exported `plugins` array is used to load configurable features. The are
all optional, other than `default-bindings`. Custom plugins can also be
loaded by using relative paths, e.g. './my-plugin'.

The exported `options` object is used to personalize settings such as
colors.
*/
const completionCommands = require('./command-completion')


let monokaiHL = {
	program: '#a6e22e',  // Green monokai
	builtin: 'underline #a6e22e',
	alias: 'underline #a6e22e',
	commandError: '#f92672',  // Fuchsia monokai
	assignment: 'magentaBright',
	parameter: '#66d9ef',  // Cyan monokai
	//environment: '#f0f070', // bright yellow
	environment: '#e6db74', // VSCode monokai yellow
	option: '#ae81ff', // Purple monkai
	quote: '#fd971f',  // Orange monokai
	comment: '#666666' // Dark grey
}


module.exports = {
	plugins: [
		// Default keyboard commands - required
		'default-bindings',
		// Default propmt customization
		//   Replace 'default-prompt' with './agnoster-prompt' for a cooler
		//   prompt (but check agnoster-prompt source code before, as it has
		//   some special requirements).
		'default-prompt',
		// Tab-completion of command-line
		'completion',
		// Syntax highlighting
		'syntax-highlight',
		// Suggestion of previous command
		'suggestions',
		// History menu (activated with page-up)
		'history-menu',
		// Custom keyboard bindings
		'./custom-keys',
		// Warn on long git commit messages
		'./git-commit-len'
	],
	options: {
		colors: {
			// Uncomment the line below to make syntax highlight use the Monokai palette
			// syntaxHighlight: monokaiHL,
			// Uncomment line below if your terminal supports 16 million colors
			// trueColor: true
		},
		// Uncomment the line below to change the welcome message
		// greeting: 'Greetings, human!',
		// Command completions for common programs
		completion: { commands: completionCommands }
	}
}
