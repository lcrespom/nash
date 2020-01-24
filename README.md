# Nash
Nash is a command-line editor for `bash` or compatible shells. It handles user input to provide a better user experience, but when the user hits the `Enter` key, it simply passes the command to `bash` for processing.

Nash is implemented in JavaScript and focuses on:
- Providing great UX and productivity to the command-line: file completion, history navigation, syntax highlighting, history suggestions, etc.
- Being highly extensible and customizable.
- Bringing shell power to JavaScript developers. `zsh` is greatly configurable, but customizing it requires
	writing shell script code, which (for JS developers) is not as user friendly as JavaScript.

Nash is currently under development, but it is already usable, powerful... and colorful. See the ToDo section below for details.


## Installation
Being still under development, the way to install it is to just clone the repo, then type `npm install`. To open a shell, type `npm start`:
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
	- [x] Examples directory with documented customizations
	- [x] Copy examples to `~/.nash` upon first startup
- [ ] Line editing
	- [x] Move key binding code to separate module
	- [x] List key bindings & descriptions
	- [x] Minimize cursor glitches by hiding cursor while rewriting line
	- [x] Properly handle slow/remote terminals
	- [ ] Catch exceptions in bindings to avoid breaking the shell
	- [ ] Refactor editor.js async handling code => use more promises
	- [ ] Handle multiple independent bindings for the same key combination (**next**)
- [x] History navigation
	- [x] Basic
	- [x] Context sensitive
	- [ ] Cool popup
- [x] Prompt plugin
	- [x] Optional agnoster-style prompt
	- [x] Document agnoster prompt & place in examples dir
- [x] Completion
	- [x] Basic (tab)
	- [x] Replace ~ with home when globbing
	- [x] Advanced (navigate over list)
		- [x] Handle lists too long to display in menu
		- [x] Highlight menu content: (dirs in white, consider other cases)
		- [x] Properly format and handle paths with blanks
		- [ ] Let the user type and update menu accordingly
		- [ ] Selecting a directory (using space) opens menu with directory contents
	- [ ] Customizable (e.g. git command list, etc.) (**next**)
		- [ ] Optional subcommand description - if available, show under menu
- [x] Syntax highlight
	- [ ] Highlight JavaScript (and avoid bash parser error) (**next**)
- [x] History suggestions
	- [x] Remove suggestion decoration when the user presses enter
	- [ ] Fix bug: if suggestion text overflows to next line, it is not cleared
- [x] Configuration (~/.nash/nashrc and ~/.nash/nashrc.js)
	- [x] Load all plugins from nashrc.js
- [x] JavaScript
	- [ ] Get shell environment variables before executing JS
	- [ ] Embedded JS code context using 'with'
- [ ] Cool extensions
	- [x] Cool git prompt
		- [x] Fancy git status stripe in agnoster-prompt.js
		- [ ] Git status stripe in default prompt (**next**)
	- [ ] History popup
	- [ ] Directory navigation popup (history / tree)
	- [ ] Mouse support for all menus (keypress module supports it)
- [ ] Maximize customization
	- [x] Global settings object / API
	- [ ] Rebind/unbind keys (using binding function name as string) (**next**)
	- [ ] Color palette
		- [x] Used by syntax-highlight
		- [ ] Used by suggestions (**next**)
		- [ ] Used by default-prompt (**next**)
- [ ] Compatibility / Portability
	- [ ] GitBash support
	- [x] More linux testing
	- [x] Slow/remote terminal
- [ ] Performance
	- [ ] Benchmark together: parsing + syntax highlight - find bottlenecks, memoize if required
