# Nash
Nash is a command-line editor for `bash` and compatible shells. It handles user input to provide a better user experience, and when the user hits the `Enter` key, it simply passes the command to `bash` for processing.

Nash is implemented in JavaScript and focuses on:
- Providing great UX and productivity to the command-line.
- Being highly extensible and customizable.
- Bringing shell power to JavaScript developers. Shells such as `zsh` or `fish` are greatly configurable,
	but customizing them requires writing shell script code, which (for JS developers) is not as user-friendly
	as JavaScript. Extensions are written much faster in JS, and are easier to understand by the
	common developer.

## Quick links
- If you want to see how `nash` looks like, check some [screenshots](docs/screenshots.md).
- Check the [user manual](docs/manual.md) for a detailed description of `nash` functions.


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
	and select the file name. Completion supports other elements such as directories, command
	options and environment variables, and displays file information or option documentation
	depending on the case.
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
- [Configuration](docs/manual.md#configuration) and extensions are implemented as plain JavaScript code,
	centered around the `~/.nash/nashrc.js` file, which is loaded during startup. Example
	configuration and extensions are provided in the `~/.nash` directory, which is populated when
	`nash` is started for the first time. For instance:
	- Color settings are configured via JSON - you can make your terminal use the same color palette
		as your code editor. Most terminals support 16 million colors, and although this feature is
		initially disabled in `~/.nash/nashrc.js` to ensure compatibility, it is really worth trying
		enabling it by uncommenting the line containing `trueColor: true` near the end of the file.
	- Keyboard shortcuts are reassigned using the `bindKey` API - the example in `~/.nash/custom-keys.js`
		illustrates how to do it. The `F1` key displays the list of keyboard shortcuts, and `ctrl-k`
		displays the name of any key combination.
	- Completion helpers for known commands (git, docker, npm, etc.) are configured via JSON settings.
- An extensible plugin system which facilitates the addition of features.

Check the [ToDo](docs/TODO.md) for a list of features under development and planned for the future. Suggestions are welcome.


## Installation

> If after a successful installation you get strange behavior, see
> [Starting nash](docs/manual.md#starting-nash) for troubleshooting. Also, check the
> [Recommended prerequisites](#recommended-prerequisites) section below.

### If you have `node` and `npm` installed
As usual:
```bash
$ npm install -g bnash  # the "nash" name was taken in npm ¯\_(ツ)_/¯
```

Then just type `bnash` to launch it.

> If you get installation errors containing `node-gyp` in the error messages, this is because you need
> to install the native build tools first. That installation depends on the OS - for example, for Ubuntu
> the following command installs those prerequisites:
> ```bash
> $ sudo apt-get install build-essential
> ```
> You can get more details in the [node-gyp installation document](https://github.com/nodejs/node-gyp#installation).
>
> ...Or you can just download the binary installation: see the next section.

### Binary installation
The [releases](https://github.com/lcrespom/nash/releases) page contains binary packages for Linux and MacOS.
You can download the appropriate `nash-[version]-[platform].tar.gz` file, then unpack it into a directory of your
choice. For example:
```bash
$ mkdir ~/nash-inst
$ cd ~/nash-inst
$ # Use the appropirate link for nash-[version]-[platform].tar.gz
$ curl -OL https://github.com/lcrespom/nash/releases/download/1.10.1/nash-1.10.1-linux.tar.gz
$ tar -xzf nash-1.10.1-linux.tar.gz
```
Finally, to run nash:
```bash
$ ./nash
```
To easily launch `nash` in the future, you can copy the extracted files somewhere in your `$PATH`.
An appropriate place is `/usr/local/bin`:
```bash
$ sudo cp nash pty.node /usr/local/bin
```
From then on, you can simply launch it by typing `nash`.

> The binary distribution packages nash code along with the node.js runtime in a single executable,
> except for the `pty.node` file, which must be placed alongside. The packaging is done using the great
> [pkg tool](https://github.com/zeit/pkg).

### From source code
If you want to run `nash` from the source code (and maybe help with development), just clone the repo and type `npm install`. Then, to open a shell, type `node src/nash`.
```
$ git clone https://github.com/lcrespom/nash.git
$ npm install
$ node src/nash
```

### Windows
There is no direct Windows support, but an Ubuntu terminal can be installed in windows very easily through the Microsoft Store. See instructions [here](https://tutorials.ubuntu.com/tutorial/tutorial-ubuntu-on-windows).

## Recommended prerequisites
In order to get the best experience from `nash`, the following prerequisites are recommended:

### Powerline fonts
A collection of fonts that are optimized for the terminal and contain useful symbol characters,
e.g. for displaying a fancy prompt, git repository symbol, etc.
They can be downloaded form [here](https://github.com/powerline/fonts).

Once the terminal is configured to use a powerline font, add the following entry in the exported
`options` of `.nash/nashrc.js`:
```javascript
   prompt: { powerFont: true }
```
This will tell the prompt plugin that it can use fancy symbol characters, e.g. for the git status.

### A good terminal app
The default terminal application that comes preinstalled with the OS is usually quite limited, and may
even cause defective output or glitches when `nash` tries to generate colorful output. The recommended
alternatives are the following:
- **Mac**: [iTerm2](https://iterm2.com/). Although the default terminal is quite powerful, it does not
	support 16 million colorws (see below).
- **Windows**:
	- [Windows Terminal](https://github.com/Microsoft/Terminal). The GitHub page contains
	instructions for different installation methods, and at the very beginning of the `README.md` there
	is a link to the app in the Microsoft Store, which is the easiest installation method.
	- The terminal provided by the Ubuntu WSL app is also quite decent.
- **Linux**: most Linux distributions come with a powerful terminal by default.

Once you are using a good terminal app, make sure you enable 16 million color support by uncommenting the
line `trueColor: true` in the `options` of `.nash/nashrc.js`. Some pugins make use of this feature, but it is
disabled by default because there is no safe way to detect 16 million color support, and attempting
to use this feature on a terminal that does not support it results in unreadable output.

## Related projects
If you are thinking about using JavaScript to implement your shell scripts, check out [ShellJS](https://github.com/shelljs/shelljs).

If you are looking for a full shell interpreter with good UX, check out [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) and [Fish Shell](https://fishshell.com/).
