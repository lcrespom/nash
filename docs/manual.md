# User Manual

## Keyboard shortcuts
- Cursor movement
    - **left**: moves the cursor left.
    - **right**: moves the cursor right.
    - **ctrl-b**: moves the cursor one word to the left.
    - **ctrl-f**: moves the cursor one word to the right.
    - **home**, **ctrl-a**: moves the cursor to beginning of the line.
    - **end**, **ctrl-e**: moves the cursor to end of the line.
- Line editing
    - **backspace**: deletes the character at the left of the cursor.
    - **delete**: deletes the character at the cursor position.
    - **meta-backspace**: deletes the word at the left of the cursor.
    - **escape**, **ctrl-u**: clears the current line and stores it in a buffer.
    - **ctrl-y**: recovers the cleared line.
- Miscellaneous
    - **return**: runs the command currently being edited.
    - **ctrl-c**: discards the line.
    - **ctrl-l**: clears the screen.
    - **ctrl-d**: If the command line is empty, quits `nash` and returns to the parent shell.
- Command and directory history
    - **up**: moves backwards through history.
    - **down**: moves forward through history.
    - **ctrl-space**: accepts the line suggestion, i.e., the dim text that is not yet typed by the
        user and appears automatically at the right of the cursor when a previous command that starts
        with the current text is available. See the [Suggestions](#suggestions) section for more details.
    - **right**: if a suggestion is available and the cursor is at the end of the line,
        it will accept the suggestion.
    - **pageup**: shows a menu with matching command history lines. See the [History menu](#history-menu)
        section for more details.
    - **pagedown**: shows a menu with matching directory history. See the [History menu](#history-menu)
        section for more details.
- Completion
    - **tab**: completes the word at the left of the cursor. See the [Tab completion](#tab-completion) section for a detailed description.
- Help
    - **ctrl-k**: waits for the user to type a key, then names it. If a keyboard
        shortcut is assigned to it, it is described.
    - **f1**: lists all keyboard shortcuts along with their description and function name.

## Configuration
When `nash` runs for the first time, it creates the `.nash` directory in the user home path and
places several files in there. Among them, file `nashrc.js` is the main entry point for
user configuration and extension of the tool, and is created with useful defaults.
The file is a plain `node.js` JavaScript module, with access to all the standard
[Node API](https://nodejs.org/docs/latest/api/), along with the JavaScript modules from `nash` itself.
Other than any initialization code that the user may place, the file should always export two properties
via the `module.exports` object:
- **plugins**: an array of strings containing the list of `nash` plugins to be loaded, in order.
    A `nash` plugin is a JavaScript module that extends the tool with some specific functionality, by registering
    itself with some core `nash` component. For example, the [completion](#completion) plugin registers
    handlers to the `page up` and `page down` keys.
    
    The default configuration exports all the default plugins from `nash`, which provide all the functionality
    documented below in the [Plugins](#plugins) section. Users can add their own plugins, or even replace
    some of the default ones with an alternate implementation. Such is the case with the [Prompt](#prompt) plugin,
    which is relatively simple to replace with a custom one.

- **options**: an object with the user settings, which the plugins will take into account accordingly.
    For example, the *colors* property is an object with color settings, used by the prompt, syntax highlight
    and suggestions plugins. Options for each plugin are described in the corresponding plugin section.

    The default `nashrc.js` file includes some defaults and has other sample options commented out, which
    the user can uncomment to test out.

> Check the [Configuring colors](#configuring-colors) section to see how colors are configured.

## Plugins

### Prompt
The prompt plugin displays the prompt in front of the cursor, and is made up of the following *segments*:
- **User @ Host**: the user name and host name.
- **Directory**: the current working directory.
- **Git status**: if the working directory belongs to a Git repository, it displays the current branch name
    along with some flag characters that identifies the repository status.

The prompt plugin supports the following configuration options:
- **colors.prompt**:
    - **userAtHost**: color of the user@host segment.
    - **path**: color of the directory segment.
    - **gitDirty**: color of the Git segment, when the repository is *dirty*, i.e., it has some uncommited files.
    - **gitClean**: color of the Git segment, when the repository is clean.
- **prompt**:
    - **showUserAtHost**: boolean specifying whether to show the user@host segment or not.
    - **showDir**: boolean specifying whether to show the directory segment or not.
    - **showGit**: boolean specifying whether to show the Git status segment or not.
    - **maxDirs**: number - if present, limits the number of directory levels to show in the directory segment.
        This option is used to abbreviate the display of potentially long working directories.
    - **parentDirMaxLen**: number - if present, limits the length of each directory in the directory segment,
        except for the current directory, which is always displayed in full length.
    - **parentDirEllipsis**: if present, this string is appended to directories that have been shortened
        by the **parentDirMaxLen** option.
    - **maxDirEllipsis**: if present, this string is prepended to the directory segment to indicate that
        the **maxDirs** parameter has shortened it.

### Tab completion
The tab-completion plugin is activated by typing the `tab` key, and helps the user by completing the
text at the left of the cursor. If there is only one possible completion, the text is added to the line.
If multiple completions are available, a menu with all options is displayed, so the user can select
the correct one and continue typing.

It has different working modes:
- When the cursor is right next to the first word of the line, the user is trying to type a command.
    Typing `tab` at this point displays a menu with the available commands that begin with the text at
    the left of the cursor.
- When the cursor is after a command, the user is trying to type a command parameter, quite probably a file
    name. Typing `tab` at this point displays a menu with all matching files in the current directory.
- When the cursor at the very beginning of a line or the command is `cd`, typing `tab` displays a menu with
    all matching subdiretories of the current directory. In this case and the case above, after selecting a
    directory from the menu, typing `tab` again will display the content of the selected subdirectory.
    The user can continue pressing `tab` and selecting subdirectires as long as required.
- When the cursor is right next to a word starting with `$`, the user is trying to type an environment variable.
    Typing `tab` at this point displays a menu with the list of environment variables known by `nash`.
    Notice that `nash` cannot capture all the variables available in the current session, so there can be
    more variables not listed in the menu, which will have to be typed by hand.

In all working modes, when the menu is displayed, the search can be narrowed down by typing further characters, 
thus filtering out the items that do not start with word at the left of the cursor.

The menu is navigated by using the cursor keys. The `return` key accepts the selected item
and adds it to the command line, and the `escape` key closes the menu without updating the command line.

The completion plugin can be configured via the **completion.commands** option. The sample file
`~/.nash/command-completion.js` defines the list of parameters that are expected by `git`, `docker`, `npm` and `kubectl`, and more can be easily added - just check the source code to see how the lists are configured.

### Syntax highlight
This plugin parses the command line as the user types it, and gives different colors to the different
parts of it. It distinguishes the following parts of a command:
- **Program**: any executable program or script.
- **Builtin**: builtin functions of `bash` such as `echo`, `alias`, etc.
- **Alias**: commands registered as alias via the `alias` builtin.
- **Command error**: a word in a command position, but that is not identified as any of the above.
- **Option**: a command parameter that starts with `-`.
- **Parameter**: any other unquoted command parameter.
- **Quote**: text between quotes.
- **Redirect**: a redirection such as `>file`.
- **Environment**: an environment variable such as `$PATH`.
- **Assignment**: an environment variable assignment, e.g. `greeting="Hello"`.
- **Comment**: any text after `#`.

The configuration option **colors.syntaxHighlight** expects an object with an optional property for
each of the above types. You can check the source code of `~/.nash/nashrc.js` to see how it is configured.

### Suggestions
This plugin looks into the command history, and if it finds a command that begins with what the user
is typing, it displays the most recen one at the end of the current line in a dim color. The user
can type `ctrl-space` at any moment to complete the line with the suggestion. If the cursor is at
the end of the line, the `right` key can also be used.

The suggestion color can be configured with the **colors.suggestion.scol** property.

### History menu
Nash keeps track of both command and directory history:
- **Command history**: all executed commands are recorded and added to the `~/.nash/history` file.
- **Directory history**: all directories visited via `cd` are recorded and added to the
    `~/.nash/dirHistory` file.

This plugin provides menus for displaying and interactively searching through both of them:
- When the user types the `page-up` key, a drop-down menu with recent commands is shown,
selecting the most recent one. The menu displays only the lines that begin with the current
text, and typing more text further filters out the menu.
- When the user types the `page-down` key, a drop-down menu with recent directories is shown.
The menu displays only the directories that contain the current text, and typing more text further
filters out the menu.


## Configuring colors
Earch color property is configured via a string. Here is an excerpt of an example `nashrc.js` file:
```javascript

module.exports = {
	plugins: [
        //... plugins here
	],
	options: {
		colors: {
            prompt: {
                userAtHost: 'underline green',
                path: 'yellow'
            }
        }
        // ... other options here
	}
}
```

The **colors** option contains color configuration objects for different plugins. In the above
example, color preferences for the `default-prompt` plugin are defined. Each color property is
a string with one or more words separated by a space. Each word can be one of the following:
- A standard terminal color name: black, red, green, yellow, blue, magenta, cyan, white,
    blackBright (alias: gray, grey), redBright, greenBright, yellowBright, blueBright,
    magentaBright, cyanBright and whiteBright.
- A text modifier: bold, dim, italic, underline, inverse, hidden, strikethroug, reset. Notice
    that text modifiers are frequently ignored by terminals, or else interpreted freely.
    Testing is required in order to see their effect, but don't expect all of them to work.
- A hexadecimal RGB color value, in CSS style, e.g. '#e6db74'.
- Background colors can be set by prepending any color name or hexadecimal code with `/`.
    For example: `white /blue` can be used to configure white foregroud on blue background.

Some examples of valid color configuration strings are the following:
- `bold yellow /blue`: Bold yellow text on blue background.
- `underline #ff00ff`: Underlined bright magenta text over default background.
- `green /#fd971f`: green text on orange background.

> Text coloring in `nash` is supported via the great [chalk](https://github.com/chalk/chalk) library.
