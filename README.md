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
	- [ ] History navigation
		- [x] Basic
		- [ ] Context sensitive
		- [ ] Cool popup
	- [ ] Completion
		- [ ] Basic (tab)
		- [ ] Advanced (navigate over list)
- [ ] Execute commands
	- [x] Delegate to external shell
	- [ ] Investigate continuoulsy live child shell process
	- [ ] Builtins
		- [ ] cd, alias, history...
		- [ ] Environment variable assignment (with limitations)
		- [ ] Customization: plugin loading, key bindings, etc.
- [ ] Properly handle asynchronous key bindings
	- [x] Shell commands: ignore any typed key
	- [ ] Interactive bindings: forward key events
- [ ] Substitution
	- [ ] JavaScript
	- [ ] Alias
	- Environment variables and global expansion is handled by /bin/sh
- [ ] Syntax highlight
- [ ] Configuration (json)
- [ ] Extensions (bindings / handlers)
