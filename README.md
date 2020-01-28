# Nash
Nash is a command-line editor for `bash` and compatible shells. It handles user input to provide a better user experience, but when the user hits the `Enter` key, it simply passes the command to `bash` for processing.

Nash is implemented in JavaScript and focuses on:
- Providing great UX and productivity to the command-line.
- Being highly extensible and customizable.
- Bringing shell power to JavaScript developers. Shells such as `zsh` or `fish` are greatly configurable,
	but customizing them requires writing shell script code, which (for JS developers) is not as user
	friendly as JavaScript.

![alt text](nash.png)

Pressing F1 at any time displays a list of all keyboard shoutcuts and their corresponding actions.

## Main features
- Flexible prompt, configurable by settings and by JavaScript code.
- Powerful command history navigation: the `up` and `down` keys navigate the history, showing only the entries
	that start with the current line. The `page up` key displays a menu with all history lines that
	start with the current line.
- Directory history navigation: the `page down` key displays a menu with the most recently visited directories,
	showing only the entries that contain the text in the current line.
- Interactive tab-completion: pressing tab completes a file name, but if multiple matching files are
	available, a menu is displayed, letting the user navigate and select the file name.
- Syntax highlight, clearly coloring the different parts of a command, and warning of potential errors.
- History suggestions: when typing a command, if the text matches a previous command, the remaining text
	is displayed in grey, letting the user immediately complete the command.
- Configurable color palette. Colors can be configured by name (e.g. red, gren, etc.) or by RGB hex as
	in CSS (e.g. #a6e22e).
- Configuration and extensions are implemented as plain JavaScript code, centered around the `~/.nash/nashrc.js` file,
	which is loaded during startup. Example configuration and extensions are provided in the `~/.nash` directory,
	which is populated when `nash` is started for the first time. For instance:
	- Color settings are configured via JSON settings.
	- Keyboard shortcuts are reassigned using the `bindKey` API.
	- Completion helpers for known commands (git, docker, npm, etc.) are configured via JSON settings.
- An extensible plugin system which facilitates the addition of features.

Check the [ToDo](TODO.md) for a list of features under development.


## Installation
Being still under development, the way to install `nash` is to just clone the repo, then type `npm install`. To open a shell, type `npm start`.
```
git clone https://github.com/lcrespom/nash.git
npm install
npm start
```

### Windows
There is no direct Windows support, but an Ubuntu terminal can be installed in windows very easily through the Microsoft Store. See instructions [here](https://tutorials.ubuntu.com/tutorial/tutorial-ubuntu-on-windows). You will need to install the Ubuntu version of `node` and `npm` through the debian package manager, i.e. `sudo apt install node` and `sudo apt install npm`, respectively.
