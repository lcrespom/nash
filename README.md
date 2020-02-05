# Nash
Nash is a command-line editor for `bash` and compatible shells. It handles user input to provide a better user experience, but when the user hits the `Enter` key, it simply passes the command to `bash` for processing.

Nash is implemented in JavaScript and focuses on:
- Providing great UX and productivity to the command-line.
- Being highly extensible and customizable.
- Bringing shell power to JavaScript developers. Shells such as `zsh` or `fish` are greatly configurable,
	but customizing them requires writing shell script code, which (for JS developers) is not as user-friendly
	as JavaScript. Extensions are written much faster in JS, and are easier to understand by the
	common developer.

![alt text](docs/nash.png)

Pressing F1 at any time displays a list of all keyboard shoutcuts and their corresponding actions.

> Check the [user manual](docs/manual.md) for a detailed description of `nash` functions.

## Main features
- Flexible [prompt](docs/manual.md#prompt), configurable by settings and by JavaScript code.
- Powerful [command history](docs/manual.md#history-menu) navigation:
	- The `up` and `down` keys navigate the history, showing only the entries
	that start with the current line.
	- The `page up` key displays a menu with all history lines that start with the current line.
- [Directory history](docs/manual.md#history-menu) navigation: the `page down` key displays
	a menu with the most recently visited directories, showing only the entries that contain the
	text in the current line.
- Interactive [tab-completion](docs/manual.md#tab-completion): pressing tab completes a file name,
	but if multiple matching files are available, a menu is displayed, letting the user navigate
	and select the file name.
- All menus (command history, directory history and tab-completion) allow typing more characters
	to narrow the search.
- [Syntax highlight](docs/manual.md#syntax-highlight), clearly coloring the different parts of a command,
	and warning of potential errors.
- [History suggestions](docs/manual.md#suggestions): when typing a command, if the text matches
	a previous command, the remaining text is displayed in grey, letting the user immediately complete
	the command.
- All these features are also available when establishing a connection with a
	[remote system](docs/manual.md#support-for-remote-connections), even if `nash` is not installed
	in the remote system: only `bash` is required. This is especially useful when:
	- Accessing restricted systems where installing `nash` is not easy or even not possible.
	- Accessing small or short-lived environments, such as a docker container.
- Configurable [color palette](docs/manual.md#configuring-colors). Colors can be configured by
	name (e.g. "red", "gren", etc.) or by RGB hex as in CSS (e.g. #a6e22e).
- [Configuration](manual.md#configuration) and extensions are implemented as plain JavaScript code,
	centered around the `~/.nash/nashrc.js` file, which is loaded during startup. Example
	configuration and extensions are provided in the `~/.nash` directory, which is populated when
	`nash` is started for the first time. For instance:
	- Color settings are configured via JSON - you can make your terminal use the same color palette
		as your code editor.
	- Keyboard shortcuts are reassigned using the `bindKey` API.
	- Completion helpers for known commands (git, docker, npm, etc.) are configured via JSON settings.
- An extensible plugin system which facilitates the addition of features.

Check the [ToDo](docs/TODO.md) for a list of features under development and planned for the future. Suggestions are welcome.


## Installation
The [releases](https://github.com/lcrespom/nash/releases) page contains binary packages for Linux and MacOS.
You can download the appropriate `nash-[version]-[platform].tar.gz` file, then unpack it into a directory of your
choice. For example:
```bash
$ mkdir ~/nash-inst
$ cd ~/nash-inst
$ # Use the appropirate link for nash-[version]-[platform].tar.gz
$ curl -OL https://github.com/lcrespom/nash/releases/download/1.3.1/nash-1.3.1-linux.tar.gz
$ tar -xzf nash-1.3.1-linux.tar.gz
```
Finally, to run nash:
```bash
$ ./nash
```
It is important that the first time `nash` is executed from the directory where the `.tar.gz` file is
extracted, so it can copy the example code to `~/.nash`. After that, you can copy the extracted files
somewhere in your `$PATH`. An appropriate place is `/usr/local/bin`:
```bash
$ sudo cp nash pty.node /usr/local/bin
```
From then on, you can simply launch it by typing `nash`.

> See [Starting nash](docs/manual.md#starting-nash) if you experience any problems when running it.

If you want to run it from the source code (and maybe help with development), just clone the repo and type `npm install`. Then, to open a shell, type `npm start`.
```
$ git clone https://github.com/lcrespom/nash.git
$ npm install
$ npm start
```

### Windows
There is no direct Windows support, but an Ubuntu terminal can be installed in windows very easily through the Microsoft Store. See instructions [here](https://tutorials.ubuntu.com/tutorial/tutorial-ubuntu-on-windows).


## Related projects
If you are thinking about using JavaScript to implement your shell scripts, check out [ShellJS](https://github.com/shelljs/shelljs).

If you are looking for a full shell interpreter with good UX, check out [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) and [Fish Shell](https://fishshell.com/).
