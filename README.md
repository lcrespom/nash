# Nash
Nash is a command-line shell that uses JavaScript and Node.js for scripting.

## TODO
- [x] Parse
- [x] Read from console
- [ ] Line editing
	- [x] Simple chars
	- [x] Basic movement: left, right, backspace, home, end
	- [x] Enter
	- [x] Ctrl-C
	- [x] Ctrl-D
	- [ ] Lines longer than the terminal width
	- [ ] Multi-line (open quotes, `\`)
	- [x] History navigation
- [ ] Execute commands
	- [x] Delegate to external shell
	- [ ] Builtins
		- [ ] cd, alias, history...
		- [ ] Environment variable assignment (with limitations)
		- [ ] Customization: plugin loading, key bindings, etc.
- [ ] Substitution
	- [ ] JavaScript
	- Environment variables and globa expansion is handled by /bin/sh
- [ ] Syntax highlight
- [ ] Configuration (json)
- [ ] Extensions (bindings / handlers)
