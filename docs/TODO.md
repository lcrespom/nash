# ToDo

## Documentation
- [x] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [x] Usage
    - [x] Remote mode
    - [x] How to execute `nash` to ensure `bash` is located
    - [ ] Record videos with https://asciinema.org/
- [ ] Customization / Extension API
    - [ ] Writing your own plugin (start/stop, etc)
- [ ] Contribution guide
- [ ] Make it visible
    - [ ] Twitter
    - [ ] Blog post
    - [ ] Youtube walkthrough

## Installation
- [x] Check that .nash/*.js scripts load correctly with binary distribution
- [ ] Add the packaging script to the repository & binaries to .gitignore

## Line editing
- [x] Refactor editor.js async handling code, make kb bindings use promises
- [x] Move line under prompt when line overflows
- [ ] Remove old duplicates from history/dirHistory
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Improve support for multi-line prompt (agnoster), e.g. in
    completion.tooManyWords and in directory history.

## Bugs
- [x] If suggestion text overflows to next line, it is not cleared
- [x] Test & fix command completion
    - [x] Local commands, e.g. `./my-script.sh`
    - [x] Command completion in remote environments
- [ ] Completion goes back one dir if target is empty
- [ ] Aliases are not detected by the which command

## History navigation
- [x] Basic
- [x] Context sensitive (show entries that start with the current line)
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [x] Interactive: let the user type and update the menu accordingly

## Prompt plugin
- [x] Config options to personalize what to show on prompt
- [x] Separate user + at + host
- [x] Identify remote sessions
- [x] Optional agnoster-style prompt
- [x] Document agnoster prompt & place in examples dir

## Completion
- [ ] Optional background color for menus (table and list)
- [ ] Selecting a directory (using space) opens menu with directory contents
- [ ] Add `..` to the directory list for `cd`.
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
- [x] Just type `ctrl+r` on a remote shell to activate nash line editor
- [x] Avoid reading local files and rely on piping `ls -1ap` (e.g. tab-completion)
- [x] Get hostname from runner status
- [x] Don't do chdir in remote sessions
- [x] Get all environment data from bash, e.g. don't use process.cwd.
    Create specific `env` module with cwd, chdir, ls, homedir, which, etc.
    - [x] Implement remote which by listing programs in path
    - [x] Detect when bash is remote (e.g. env.hostname != os.hostname)
    - [x] Adapt git-status plugin / move runCommand function to env /
        search for other execFileSync invocations
    - [x] Refactor to use much more promises and async/await, less plain callbacks
- [x] Hide the $P1=... text when user types ctrl+r
- [x] Independent history files for each host
