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
    - **shift-up**: changes to the parent directory.
    - **shift-down**: moves one directory back in history.
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
    some of the default ones with an alternate implementation. For information on how to write custom plugins,
    check the [plugin howto](plugin-howto.md).

- **options**: an object with the user settings, which the plugins will take into account accordingly.
    For example, the *colors* property is an object with color settings, used by the prompt, syntax highlight
    and suggestions plugins. Options for each plugin are described in the corresponding plugin section.

    The default `nashrc.js` file includes some defaults and has other sample options commented out, which
    the user can uncomment to test out.

> Check the [Configuring colors](#configuring-colors) section to see how colors are configured.

## Plugins

### Prompt
![The prompt, showing different git statuses](img/git-prompt.png)

The prompt plugin displays the prompt in front of the cursor, and is made up of the following *segments*:
- **User @ Host**: the user name and host name.
- **Directory**: the current working directory.
- **Git status**: if the working directory belongs to a Git repository, it displays the current branch name
    along with some flag characters that identifies the repository status.

The prompt plugin supports the following configuration options:
- **colors.prompt**:
    - **user**: color of the user name.
    - **at**: color of the `@` symbol.
    - **host**: color of the host name.
    - **remoteHost**: color of the host name in a remote session
        (see [below](#support-for-remote-connections) for a description of remote sessions).
    - **path**: color of the working directory.
    - **gitDirty**: color of the Git segment, when the repository is *dirty*, i.e., it has some uncommited files.
    - **gitClean**: color of the Git segment, when the repository is clean.
- **prompt**:
    - **showUser**: boolean specifying whether to show the user name or not - defaults to true.
    - **showAt**: boolean specifying whether to show `@` or not - defaults to true.
    - **showHost**: boolean specifying whether to show the host name or not - defaults to true.
    - **showPath**: boolean specifying whether to show the directory segment or not - defaults to true.
    - **showGit**: boolean specifying whether to show the Git status segment or not - defaults to true.
    - **powerFont**: boolean specifying whether the current font is a *powerline* font, i.e., supports
        fancy symbols - defaults to false.
        See the [recommended prerequisites](../README.md#recommended-prerequisites) section for more details.
    - **maxDirs**: number - if present, limits the number of directory levels to show in the directory segment.
        This option is used to abbreviate the display of potentially long working directories.
    - **parentDirMaxLen**: number - if present, limits the length of each directory in the directory segment,
        except for the current directory, which is always displayed in full length.
    - **parentDirEllipsis**: if present, this string is appended to directories that have been shortened
        by the **parentDirMaxLen** option.
    - **maxDirEllipsis**: if present, this string is prepended to the directory segment to indicate that
        the **maxDirs** parameter has shortened it.

### Tab completion
![File completion, with scrollbar and file description](img/file-completion.png)
![Option completion, with description from man pages](img/option-completion.png)


The tab-completion plugin is activated by typing the `tab` key, and helps the user by completing the
text at the left of the cursor. If there is only one possible completion, the text is added to the line.
If multiple completions are available, a menu with all options is displayed, so the user can select
the correct one and continue typing.

It has different working modes:
- When the cursor is right next to the first word of the line (or after a command separator such
    as `;` or `&&`), the user is typing a command.
    Typing `tab` at this point displays a menu with the available commands that begin with the text at
    the left of the cursor.
- When the cursor is after a command, the user is typing a command parameter, quite probably a file
    name. Typing `tab` at this point displays a menu with all matching files in the current directory.
- When the line is empty or the command is `cd`, typing `tab` displays a menu with all matching subdirectories
    of the current directory. In this case and the case above, after selecting a directory from the menu,
    typing `tab` again will display the content of the selected subdirectory. The user can continue
    pressing `tab` and selecting subdirectires as long as required.
- When the cursor is after a `-`, the user is typing a command option, e.g. the `-l` in `ls -l` to specify
    that we want to list files in long format. Typing `tab` at this point makes `nash` search in the
    `man` documentation for the current command and, if present, display all available options along with
    their description.
- When the cursor is right next to a word starting with `$`, the user is typing an environment variable.
    Typing `tab` at this point displays a menu with the list of environment variables known by `nash`.
    Notice that `nash` cannot capture all the variables available in the current session, so there can be
    more variables not listed in the menu, which will have to be typed by hand.

Different colors are used to identify the different types of elements being displayed in the menu (e.g.
files, commands, directories, options, etc). When a description for the selected element is available,
it is displayed under the menu. In the case of file elements (including directories and commands),
the description contains the file attributes, user, group, size and date, as provided by `ls -l`.

In all modes, when the menu is displayed, the search can be narrowed down by typing further characters, 
thus filtering out the items that do not start with the word at the left of the cursor.

The menu supports the following keys:
- Cursors and `page-up` / `page-down`: navigate through the menu.
- `Return`: accept the selected item and add it to the current line.
- `Escape`: close the menu without updating the command line.
- `Space`: if the selected item is a directory, open its contents and keep navigating the menu.

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
![Interactive command history, each line with syntax highlight](img/command-history.png)

Nash keeps track of both command and directory history:
- **Command history**: all executed commands are recorded and added to the
    `~/.nash/history/[hostname].history` file.
- **Directory history**: all directories visited via `cd` are recorded and added to the
    `~/.nash/history/[hostname].dirHistory` file.

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


## Starting `nash`
When `nash` starts, it tries to locate `bash` with the following rules:
- First, it checks if the name of the shell is passed as a parameter, e.g. `nash bash`.
- If a command-line parameter is not present, it looks for the value of the `$TERM` environment
    variable.
- If none of the above are present, it simply assumes `bash` is the name.

Most of the time you won't need to worry and just call `nash`. However, if you are launching
it from a shell other than `bash`, such as `fish` or `zsh`, then you `$TERM` may not be
properly set, and you should add `bash` as a parameter when launching `nash`.

In summary: in case something does not work as expected, try running `nash bash`.


## Support for remote connections
Because `nash` is just a UI wrapper around `bash`, it can be used in a remote
connection **even if `nash` is not installed in the remote system**: only `bash`
is required.

When connecting to a remote system, e.g. via `ssh` or using a `docker run -it ...`
command, the UI will be the default one provided by the remote system. If
the remote shell is `bash`, the user can type `ctrl+r` at the command line to
make `nash` take control of the line editor and provide the same functionality
as on the machine it was installed.

Nash keeps separate command and directory histories for each different host, so
the commands typed on each environment are context-specific.


## How `nash` works
If you are curious, here is how `nash` is able to improve the UX of `bash` while
at the same time relying on it for all the command processing: by opening `bash`
in a [pseudo-terminal](https://en.wikipedia.org/wiki/Pseudoterminal) and then
controlling all input and output to and from it.

Once `nash` sits in the middle between the real terminal and `bash`, the trick
to this technique is knowing when is `bash` showing the prompt and
waiting for the user to enter the next command, and when is it running a command
from the user. To detect when `bash` is showing the prompt, `nash` sets `$PS1`
(the main prompt variable) to display a very specific sequence of characters.
In this case, the sequence `'\x1E\x1E>'` is used, but any other weird prompt
sequence would be fine, as long as it does not appear in the normal output from
a command - and the fact that `\x1E` is a non-displayable character ensures that.

When the special prompt mark is detected, `nash` replaces it with the configured
prompt, and provides its own line editor, along with all the colors and widgets
such as the interactive menus. The moment the user hits enter, the edited command
is passed along to `bash`, and input and output is piped between the real terminal
and `bash`, until the command execution ends and `bash` shows the prompt again,
and `nash` fancy line editor takes control again.

This technique allows `nash` to be used on remote systems: after all, it is just
piping characters from one place to another. There are some cases where access
to the local environment is required, for example in order to show a menu with
the files in the current directory. In such cases, `nash` knows that it is on a
remote environment and then issues a *hidden* `ls` command, gathering the output
and building the menu from it.

As the reader may have concluded at this point, all this involves some level
of hacking, which means that there is a risk that something unexpected sets
`nash` in an invalid state. This risk is relatively low, but in case the
terminal becomes unresponsive, the `shift-meta-q` key combination immediately
quits `nash`, returning to the parent shell.
