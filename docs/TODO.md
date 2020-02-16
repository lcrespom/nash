# ToDo

## Documentation
- [x] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [x] Recommended prerequisites
- [x] Usage
    - [x] Remote mode
    - [x] How to execute `nash` to ensure `bash` is located
    - [x] Document *panic* key
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
- [x] Add the packaging script to the repository & binaries to .gitignore

## Configuration
- [ ] Interactive options editor (triggered by e.g. F4)
    - [ ] Color picker / property type support
    - [ ] Read and write `~/nash/options.js`

## Line editing
- [x] Remove old duplicates from history/dirHistory
    (upon startup - cannot do on the fly)
- [ ] Catch exceptions in bindings to avoid breaking the shell

## History navigation
- [x] Menu (pageup)
    - [x] Cut lines longer than process.stdout.columns
    - [x] Interactive: let the user type and update the menu accordingly

## Prompt plugin
- [x] Document agnoster prompt & place in examples dir
- [ ] Make agnoster use features from default prompt

## Completion
- [x] File completion for file redirects (echo hello > a.txt)
- [x] Optional description - if available, show under menu
- [x] Parse man pages to generate descripitons
- [x] File info in description line
    - [ ] Color config for file info
- [ ] Bug in **command** completion
- [ ] Change `~/` in menu into proper directory name
- [ ] Mouse support
    - Keypress module supports it
    - Implement in menu module
    - Send command '\x1b[?1005h' to enable mouse x > 95

## Syntax highlight
- [ ] Aliases are not detected by the which command => implement
    via runHiddenCommand at startup

## History suggestions
- [x] Remove suggestion decoration when the user presses enter
- [x] Ctrl-space accepts suggestion anywhere in the line
 
## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'

## History menu
- [ ] Delete key removes line from history

## Compatibility / Portability
- [ ] GitBash support (...very long term)
- [ ] Docker instructions for Windows
- [x] More linux testing
- [x] Slow/remote terminal
