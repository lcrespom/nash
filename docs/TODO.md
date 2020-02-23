# ToDo

## Documentation
- [x] Screenshots
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
- [x] Option completion: parse option, remove extra chars
- [ ] Completion is only case insensitive while showing the menu. It
    should also be case insensitive when pressing tab.
     => Hard: `ls` command is case-sensitive.
- [ ] Mouse support
    - Keypress module supports it
    - Implement in menu module
    - Send command '\x1b[?1005h' to enable mouse x > 95

## History menu
- [x] Discard vertical menu, use single-column table menu /
    scroll bar / cool background
- [ ] Delete key removes line from history

## Syntax highlight
- [ ] Aliases are not detected by the which command => implement
    via runHiddenCommand at startup (**next**)
 
## Inline JavaScript
- [ ] Highlight JavaScript (and avoid bash parser error)
- [ ] Get shell environment variables before executing JS
- [ ] Embedded JS code context using 'with'
- [ ] ...Or maybe just get rid of it

## Compatibility / Portability
- [ ] Docker instructions for Windows
- [x] GitBash support => unfeasible
- [ ] Plain windows support from cmd/PowerShell. Options:
    - Just pseudo-tty to CMD after minor translations, e.g. $EnvVar => %EnvVar%
    - Interpret the bash AST tree, execute [ShellJS](https://github.com/shelljs/shelljs)
        when available
