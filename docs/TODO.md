# ToDo

## Documentation
- [x] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [x] Usage
    - [x] Remote mode
    - [x] How to execute `nash` to ensure `bash` is located
    - [ ] Document *panic* key
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
- [ ] Remove old duplicates from history/dirHistory
    (upon startup - cannot do on the fly)
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Improve support for multi-line prompt (agnoster), e.g. in
    completion.tooManyWords and in directory history.

## Bugs
- [ ] Shift+Fn key combinations not recognized
    (ctrl-k reports "shift-undefined"). Probably a bug in `keypress`

## History navigation
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [x] Interactive: let the user type and update the menu accordingly

## Prompt plugin
- [x] Document agnoster prompt & place in examples dir
- [ ] Make agnoster use features from default prompt

## Completion
- [x] Selecting a directory (using space) opens menu with directory contents
    - [x] Entering an empty directory ends continuous navigation.
        It should display just `../`.
    - [x] Fine-tune/fix bugs
- [x] Add `../` to the directory list for `cd`.
    - [x] Detect ../../../back/to/cwd and merge
- [x] Color configuration
- [x] Customizable (e.g. git command list, etc.)
    - [ ] Optional subcommand description - if available, show under menu
    - [ ] Parse man pages to generate descrpitons
- [ ] Mouse support (keypress module supports it)

## Syntax highlight
- [ ] Aliases are not detected by the which command

## History suggestions
- [x] Remove suggestion decoration when the user presses enter
- [x] Ctrl-space accepts suggestion anywhere in the line
 
## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'

## History menu
- [ ] Delete key removes line from history

## Bindings
- [ ] shift-up/down => cd .. / dir history back

## Compatibility / Portability
- [ ] GitBash support (...very long term)
- [ ] Docker instructions for Windows
- [x] More linux testing
- [x] Slow/remote terminal
