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
	- [ ] Customization / Extension API
- [ ] Line editing
	- [ ] Catch exceptions in bindings to avoid breaking the shell
	- [ ] Minimize cursor glitches by re-writing from the first different char
	- [ ] Refactor messy editor.js code
	- [ ] Handle multiple independent bindings for the same key combination
	- [ ] Rebind/unbind keys (using binding function name as string)
	- [ ] List key bindings & descriptions
- [x] History navigation
	- [x] Basic
	- [x] Context sensitive
	- [ ] Cool popup
- [x] Completion
	- [x] Basic (tab)
	- [ ] Replace ~ with home when globbing
	- [x] Advanced (navigate over list)
		- [ ] Handle lists too long to display in menu
		- [ ] Let the user type and update menu accordingly
	- [ ] Customizable (e.g. git command list, etc.)
- [x] Configuration (~/.nash/nashrc and ~/.nash/nashrc.js)
	- [ ] Load all plugins from nashrc.js
- [x] JavaScript
	- [ ] Get shell environment variables before executing JS
	- [ ] Embedded JS code context using 'with'
- [ ] Cool extensions
	- [ ] Cool git prompt
	- [ ] History popup
- [ ] Maximize customization
	- [ ] Improve plugin API & documentation
	- [ ] Color palette
