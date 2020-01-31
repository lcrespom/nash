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

> Check the [Colors](#colors) section to see how colors are configured.

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

### Syntax highlight

### Suggestions

### History menu
