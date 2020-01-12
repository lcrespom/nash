# Nash
Nash is a command-line shell that uses JavaScript and Node.js for scripting.

## TODO
- [x] Parse
- [x] Read from console
- [ ] Line editing
	- [x] Simple chars
	- [x] Basic movement: left, right, backspace, home, end
	- [x] Enter: run command
	- [x] Ctrl-C, Ctrl-D, etc.
	- [ ] Multi-line
		- [x] Lines longer than the terminal width
		- [x] Multi-line prompt
		- [ ] Unfinished line (e.g. open quotes)
		- [ ] `\`
	- [x] History navigation
		- [x] Basic
		- [x] Context sensitive
	- [ ] Completion
		- [ ] Basic (tab)
		- [ ] Advanced (navigate over list)
- [ ] Execute commands
	- [x] Delegate to external shell
	- [x] Permanent redirection via pseudo-tty
	- [x] Improve runner: hide command sent to pty
	- [ ] Non-interactive runner.runCommand(...)
- [x] Properly handle asynchronous key bindings
	- [x] Shell commands: ignore any typed key
	- [x] Interactive bindings: forward key events
- [x] Configuration (.nash.json / .nash.js)
- [x] JavaScript
	- [x] Detect, execute, replace
	- [x] Abort execution on error
- [ ] Cool extensions
	- [ ] Syntax highlight
	- [ ] Suggestions
	- [ ] Cool git prompt
	- [ ] History popup
