# ToDo

## Documentation
- [x] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [ ] Usage
    - [ ] Describe all key bindings
    - [ ] Tab completion
    - [ ] History
    - [ ] Check that all plugins are properly documented
    - [ ] Inline JavaScript
- [ ] Customization / Extension API
- [ ] Contribution guide

## Installation
- [ ] Provide and document an installation method that does not require
    cloning the repository.

## Line editing
- [x] Handle multiple independent bindings for the same key combination
- [x] Add more bash shortcuts in default-bindings
    (see https://ss64.com/bash/syntax-keyboard.html)
    - [x] Ctrl-y recovers deleted line
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Refactor prompt.js and editor.js async handling code => use more promises

## History navigation
- [x] Basic
- [x] Context sensitive
- [ ] Cool popup

## Prompt plugin
- [x] Optional agnoster-style prompt
- [x] Document agnoster prompt & place in examples dir
- [ ] Config option to limit length of path section

## Completion
- [x] Basic (tab)
- [x] Replace ~ with home when globbing
- [x] Advanced (navigate over list)
    - [x] Handle lists too long to display in menu
    - [x] Highlight menu content: (dirs in white, consider other cases)
    - [x] Properly format and handle paths with blanks
    - [x] Custom completion function for "cd" (in `examples`), displaying only
        directories
    - [x] Tab on empty prompt triggers "cd " + completion
    - [ ] Contemplate rest of word at right of the cursor
    - [ ] Let the user type and update menu accordingly (implement inside widget)
    - [ ] Selecting a directory (using space) opens menu with directory contents
- [x] Customizable (e.g. git command list, etc.)
    - [ ] Optional subcommand description - if available, show under menu

## Syntax highlight
    - [ ] Highlight JavaScript

## History suggestions
- [x] Remove suggestion decoration when the user presses enter
- [x] Ctrl-space accepts suggestion anywhere in the line
- [ ] Fix bugs
    - [ ] If suggestion text overflows to next line, it is not cleared
    - [ ] When at last line of terminal, if suggestion overflows, cursor
        position is not recovered.

## Configuration (~/.nash/nashrc and ~/.nash/nashrc.js)
- [x] Load all plugins from nashrc.js
- [ ] start()/stop() function in all plugins to control lifecycle

## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'

## Cool extensions
- [x] Cool git prompt
    - [x] Fancy git status stripe in agnoster-prompt.js
    - [x] Git status stripe in default prompt
- [ ] History popup
- [ ] Directory navigation popup (history / tree)
    - [x] 'cd ' + tab
    - [x] tab on empty line
    - [ ] Shift-up => cd ..
    - [ ] Shift-down => dir history back
    - [ ] Pg down => dir history menu
- [ ] Mouse support for all menus (keypress module supports it)

## Maximize customization
	- [x] Global settings object / API
	- [x] Color palette
	- [x] Rebind/unbind keys

## Compatibility / Portability
	- [ ] GitBash support
	- [x] More linux testing
	- [x] Slow/remote terminal

## Performance
	- [ ] Benchmark together: parsing + syntax highlight - find bottlenecks, memoize if required
