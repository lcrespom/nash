# User Manual

## Keyboard shortcuts
- Cursor movement
    - **backspace**: Deletes the character at the left of the cursor.
    - **delete**: Deletes the character at the cursor position.
    - **left**: Moves the cursor left.
    - **right**: Moves the cursor right.
    - **ctrl-b**: Moves the cursor one word to the left.
    - **ctrl-f**: Moves the cursor one word to the right.
    - **home**, **ctrl-a**: Moves the cursor to beginning of the line.
    - **end**, **ctrl-e**: Moves the cursor to end of the line.
- Line editing
    - **meta-backspace**: Deletes the word at the left of the cursor.
    - **escape**, **ctrl-u**: Clears the current line and stores it in a buffer.
    - **ctrl-y**: Recovers the cleared line.
    - **ctrl-l**: Clears the screen.
- Miscellaneous
    - **return**: Run the command currently being edited.
    - **ctrl-d**: Quit `nash` and return to the parent shell.
    - **ctrl-c**: Discards the line.
- Command and directory history
    - **up**: Move backwards through history.
    - **down**: Move forward through history.
    - **ctrl-space**: Accepts the line suggestion, i.e., the dim text that is not yet typed by the
        user and appears automatically at the right of the cursor when a previous command that starts
        with the current text is available. See the [Suggestions](#suggestions) section for more details.
    - **right**: If a suggestion is available and the cursor is at the end of the line,
        it will accept the suggestion.
    - **pageup**: Shows a menu with matching command history lines. See the [History menu](#history-menu)
        section for more details.
    - **pagedown**: Shows a menu with matching directory history. See the [History menu](#history-menu)
        section for more details.
- Completion
    - **tab**: Completes the word at the left of the cursor. See the [Tab completion](#tab-completion) section for a detailed description.
- Help
    - **ctrl-k**: Waits for the user to type a key, then names it. If a keyboard
        shortcut is assigned to it, it is described.
    - **f1**: Lists all keyboard shortcuts along with their description and function name.

## Configuration

## Plugins

### Prompt

### Tab completion

### Syntax highlight

### Suggestions

### History menu
