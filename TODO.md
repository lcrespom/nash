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
    - [ ] Directory navigation (when ready) 
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
    - [x] Merge histories in parallel terminal sessions (append one line at a time)
- [x] Context sensitive
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [ ] Interactive

## Prompt plugin
- [x] Config options to personalize what to show on prompt
- [x] Optional agnoster-style prompt
    - [ ] Use config options from default prompt plugin
- [x] Document agnoster prompt & place in examples dir

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

## Configuration
- [x] Load all plugins from nashrc.js
- [x] start()/stop() function in all plugins to control lifecycle

## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'

## Cool extensions
- [x] Cool git prompt
    - [x] Fancy git status stripe in agnoster-prompt.js
    - [x] Git status stripe in default prompt
- [x] History menu
- [ ] Directory navigation (**next**)
    - [x] 'cd ' + tab
    - [x] tab on empty line
    - [ ] shift-up => cd ..
    - [ ] shift-down => dir history back
    - [ ] pagedown => dir history menu
- [ ] Mouse support for all menus (keypress module supports it)

## Maximize customization
- [x] Global settings object / API
- [x] Color palette
- [x] Rebind/unbind keys

## Compatibility / Portability
- [ ] GitBash support
- [x] More linux testing
- [x] Slow/remote terminal

## Support remote bash
- [ ] Just type `PS1=$'\x1E\x1E>'` on a remote shell to activate nash line editor
- [ ] Avoid reading local files and rely on piping `ls -1ap` (e.g. tab-completion)
    - [ ] Then disable highlight from table menus, as `ls` already does
- [ ] Get hostname from runner status
- [ ] Don't do chdir from runner
- [ ] Get all environment data from bash, e.g. don't use process.cwd

## Performance
- [ ] Benchmark together: parsing + syntax highlight - find bottlenecks, memoize if required
