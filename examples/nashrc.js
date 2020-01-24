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
	environment: '#f0f070', // bright yellow
	//environment: '#e6db74', // VSCode monokai yellow (too much downsampling)
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
		'suggestions'
	],
	options: {
		// Uncoment line below to enable cool monokai syntax highlight
		// colors: { syntaxHighlight: monokaiHL },
		// Command completions for common programs
		completion: { commands: completionCommands }
	}
}
