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
    - [ ] Directory navigation
    - [ ] Check that all plugins are properly documented
    - [ ] Inline JavaScript
- [ ] Customization / Extension API
- [ ] Contribution guide

## Installation
- [x] Provide and document an installation method that does not require
    cloning the repository
- [x] Provide a fully self-contained installation that does not require
    node.js to be previously installed => see https://github.com/zeit/pkg
- [x] Upload the macos distribution to release 1.0.0.
- [ ] Create new release with bug fixes to cursor glitches (**next**)

## Line editing
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Refactor prompt.js and editor.js async handling code
    => use more promises (**next**)

## History navigation
- [x] Basic
- [x] Context sensitive (show entries that start with the current line)
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [ ] Interactive: let the user type and update the menu accordingly

## Prompt plugin
- [x] Config options to personalize what to show on prompt
- [x] Optional agnoster-style prompt
    - [ ] Use config options from default prompt plugin
    - [ ] Move reusable code from `default-prompt.js` to `prompt.js`
- [x] Document agnoster prompt & place in examples dir

## Completion
- [x] Basic (tab)
- [x] Replace ~ with home when globbing
- [x] Advanced (navigate over list)
    - [x] Custom completion function for "cd" (in `examples`), displaying only
        directories
    - [x] Improve menu library API by renaming `options` to `items`
    - [ ] Optional background color for menus (table and list)
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
    - [x] When at last line of terminal, if suggestion overflows, cursor
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
    - [ ] Delete key removes line from history
- [x] Directory navigation
    - [x] 'cd ' + tab
    - [x] tab on empty line
    - [x] pagedown => dir history menu
    - [ ] Directly run the `cd path` command after selecting it
        from the list (**next**)
    - [ ] shift-up/down => cd .. / dir history back
- [ ] Mouse support for all menus (keypress module supports it)

## Maximize customization
- [x] Global settings object / API
- [x] Color palette
- [x] Rebind/unbind keys
- [x] Setting to force truecolor on chalk

## Compatibility / Portability
- [ ] GitBash support
- [ ] Docker instructions for Windows
- [x] More linux testing
- [x] Slow/remote terminal

## Support remote bash
- [ ] Just type `PS1=$'\x1E\x1E>'` on a remote shell to activate nash line editor
- [ ] Avoid reading local files and rely on piping `ls -1ap` (e.g. tab-completion)
    - [ ] Then disable highlight from table menus, as `ls` already does
- [ ] Get hostname from runner status
- [ ] Don't do chdir from runner
- [ ] Get all environment data from bash, e.g. don't use process.cwd
    Create specific `env` module with cwd, ls, homedir, username, hostname, which,
    process.env, etc.
    - [ ] The `which` command is used on every keystroke - either disable or maximize
        memoization
    - [ ] Detect when bash is remote (e.g. env.hostname != os.hostname)

## Performance
- [x] Memoize `which` => new whichMemo instance every time return is pressed
- [ ] Benchmark together: parsing + syntax highlight - find bottlenecks, memoize if required
