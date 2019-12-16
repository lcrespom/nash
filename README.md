# Nash
Nash is a command-line shell that uses JavaScript and Node.js for scripting.

## TODO
- [x] Parse
- [x] Read from console
- [ ] Line editing
	- [x] Simple chars
	- [x] Basic movement: left, right, backspace, home, end
	- [x] Enter
	- [ ] Ctrl-C
	- [ ] Ctrl-D
	- [ ] Lines longer than the terminal width
	- [ ] Multi-line (open quotes, `\`)
- [ ] Execute commands
	- [x] Delegate to external shell
	- [ ] Builtins
		- [ ] cd, alias, ...
		- [ ] Environment variable assignment (with limitations)
		- [ ] Customization: plugin loading, key bindings, etc.
- [ ] Substitution
	- [ ] Env variables
	- [ ] JavaScript
	- [ ] Glob expansion
- [ ] Syntax highlight
- [ ] Configuration (json)
- [ ] Extensions (bindings / handlers)
