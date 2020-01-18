# Nash
Nash is a command-line editor for `bash` or compatible shells. It handles user input to provide a better user experience, but when the user hits the `Enter` key, it simply passes the command to `bash` for processing.

Nash is implemented in JavaScript and is designed to be highly extensible and customizable.

It is currently under development, so some features are still missing. See the ToDo section below for details.

## Installation
Just clone the repo, install and use `npm start` to open a shell:
```
git clone https://github.com/lcrespom/nash.git
npm install
npm start
```

### Windows
There is no direct Windows support, but an Ubuntu terminal can be installed in windows very easily through the Microsoft Store. See instructions [here](https://tutorials.ubuntu.com/tutorial/tutorial-ubuntu-on-windows). You will need to install the Ubuntu version of `node` and `npm` through the debian package manager, i.e. `sudo apt install node` and `sudo apt install npm`, respectively.


## ToDo
- [ ] Documentation
	- [ ] Usage
	- [ ] Extension API
- [ ] Line editing
	- [x] Simple chars
	- [x] Basic movement: left, right, backspace, home, end
	- [x] Enter: run command
	- [x] Ctrl-C, Ctrl-D, etc.
	- [ ] Catch exceptions in bindings to avoid breaking the shell
	- [ ] Multi-line
		- [x] Lines longer than the terminal width
		- [x] Multi-line prompt
		- [ ] Unfinished line (e.g. open quotes)
		- [ ] `\`
	- [x] History navigation
		- [x] Basic
		- [x] Context sensitive
	- [ ] Completion
		- [x] Basic (tab)
		- [ ] Advanced (navigate over list)
		- [ ] Customizable (e.g. git command list, etc.)
	- [ ] Minimize cursor glitches by re-writing from the first different char
- [x] Tidy .nash* files
	- [x] Create .nash/ diectory at ~ during startup if not present
	- [x] Place all .nash* files in there: history, nashrc, nashrc.js, plugins...
- [ ] Execute commands
	- [x] Delegate to external shell
	- [x] Permanent redirection via pseudo-tty
	- [x] Improve runner: hide command sent to pty
	- [x] Get user/cwd from bash
	- [ ] Non-interactive runner.runCommand(...)
- [x] Properly handle asynchronous key bindings
	- [x] Shell commands: ignore any typed key
	- [x] Interactive bindings: forward key events
- [ ] Handle multiple independent bindings for the same key combination
- [x] Configuration (.nash.json / .nash.js)
- [x] JavaScript
	- [x] Detect, execute, replace
	- [x] Abort execution on error
	- [ ] Get shell environment before executing JS
- [x] Parser
	- [x] Using bash-parser (https://github.com/vorpaljs/bash-parser)
- [ ] Cool extensions
	- [ ] Syntax highlight
	- [ ] Suggestions
	- [ ] Cool git prompt
	- [ ] History popup
