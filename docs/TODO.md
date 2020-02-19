# ToDo

## Documentation
- [ ] Screenshots
- [x] Features
- [x] Examples directory with documented customizations
- [x] Copy examples to `~/.nash` upon first startup
- [x] Usage
    - [ ] Record videos with https://asciinema.org/
- [x] Customization / Extension API
    - [x] Writing your own plugin (start/stop, etc)
- [ ] Contribution guide
- [ ] Make it visible
    - [ ] Twitter
    - [ ] Blog post
    - [ ] Youtube walkthrough

## Resiliency
- [ ] Ensure default color palette / truecolor setting is good
- [ ] Catch exceptions in bindings to avoid breaking the shell
- [ ] Timeout for runHiddenCommand

## Prompt plugin
- [x] Document agnoster prompt & place in examples dir
- [ ] Make agnoster use features from default prompt
- [ ] Test multi-line prompt with completion, dir history, long lines, etc.

## Completion
- [ ] Mouse support
    - Keypress module supports it
    - Implement in menu module
    - Send command '\x1b[?1005h' to enable mouse x > 95

## History menu
- [ ] Discard vertical menu, use single-column table menu + scroll bar
- [ ] Delete key removes line from history

## Syntax highlight
- [ ] Aliases are not detected by the which command => implement
    via runHiddenCommand at startup
 
## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'
- [ ] ...Or maybe just get rid of it

## Compatibility / Portability
- [ ] GitBash support (...very long term)
    - [ ] Just pty.spawn() the full commnand, then append the magic
        *get status* sequence at the end of the command.
- [ ] Docker instructions for Windows
