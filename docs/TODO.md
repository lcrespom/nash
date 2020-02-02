# ToDo

## Documentation
- [x] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [x] Usage
    - [ ] How to execute `nash` to ensure `bash` is located
- [ ] Customization / Extension API
- [ ] Contribution guide
- [ ] Make it visible
    - [ ] Twitter
    - [ ] Blog post
    - [ ] Youtube walkthrough

## Installation
- [ ] Add the packaging script to the repository & binaries to .gitignore
- [ ] Check that .nash/*.js scripts load correctly with binary distribution

## Line editing
- [x] Refactor editor.js async handling code, make kb bindings use promises
- [ ] Move line under prompt when line overflows
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Improve support for multi-line prompt (agnoster), e.g. in
    completion.tooManyWords and in directory history.

## Bugs
- [ ] Typing while non-interactive command is running makes
    `runner.checkPromptAndWrite(...)` fail
- [ ] If suggestion text overflows to next line, it is not cleared
- [ ] Aliases are not detected by the which command

## History navigation
- [x] Basic
- [x] Context sensitive (show entries that start with the current line)
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [x] Interactive: let the user type and update the menu accordingly

## Prompt plugin
- [x] Config options to personalize what to show on prompt
- [x] Optional agnoster-style prompt
    - [ ] Use config options from default prompt plugin
    - [ ] Move reusable code from `default-prompt.js` to `prompt.js`
- [x] Document agnoster prompt & place in examples dir

## Completion
- [ ] Optional background color for menus (table and list)
- [ ] Selecting a directory (using space) opens menu with directory contents
- [x] Customizable (e.g. git command list, etc.)
    - [ ] Optional subcommand description - if available, show under menu
    - [ ] Parse man pages to generate descrpitons

## History suggestions
- [x] Remove suggestion decoration when the user presses enter
- [x] Ctrl-space accepts suggestion anywhere in the line
 
## Configuration
- [x] Load all plugins from nashrc.js
- [x] start()/stop() function in all plugins to control lifecycle

## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'

## Cool extensions
- [x] History menu
    - [ ] Delete key removes line from history
- [x] Directory navigation
    - [x] 'cd ' + tab
    - [x] tab on empty line
    - [x] pagedown => dir history menu
    - [x] Directly run the `cd path` command after selecting it
        from the list
    - [ ] shift-up/down => cd .. / dir history back
- [ ] Mouse support for all menus (keypress module supports it)

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
- [x] Get all environment data from bash, e.g. don't use process.cwd (**next**).
    Create specific `env` module with cwd, chdir, ls, homedir, username, hostname, which, etc.
    - [ ] The `which` command is used on every keystroke - either disable or maximize
        memoization
    - [ ] Detect when bash is remote (e.g. env.hostname != os.hostname)
