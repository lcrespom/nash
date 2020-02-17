# Writing plugins
To write a custom `nash` plugin, the follwing steps are required:

1. Create a standard node.js module and place it in `~/.nash`.
2. Make that module export a `start` function. In there, place any initialization
    code, such as registering keyboard shortcut handlers, a custom prompt, line decorator, etc.
3. Edit `~/.nash/nashrc.js` and add the plugin name as a relative path at the end of the
    exported `plugins` array.

When `nash` starts, it requires `~/.nash/nashrc.js` and looks into its exported `plugins` property,
which contains an array of plugin paths. It then iterates that array, requiring each plugin and
executing its `start` function, if present.

## Sample plugins
When `nash` is first executed, it creates the `~/.nash` directory and places several example plugins
in there:
- `custom-keys.js`: registers 4 additional keyboard shortcuts.
- `git-commit-len.js`: registers a line decorator that warns when a git commit text is longer than 50
characters.
- `agnoster-prompt.js`: registers a custom prompt function. This plugin is disabled by default.

Those plugins are relatively simple, and illustrate `nash` extension points and API.
More details about what each plugin does and how do they make use of the extension API can be
found in their source code.

If you are writing a custom plugin, the best way to learn how to write `nash` plugins is to first
look at the sample plugins in `~/.nash`. If more details are required, directly look at
the source code of the default plugins inside the `src/plugins` directory of the source
distribution of `nash`.


## Extension API

### Keyboard bindings

#### `function bindKey(knames, code, desc)`
Binds a given key or key combination to a function, which will be invoked
	by the editor when the key is pressed.

**Parameters**:
- `knames`: (String or String[]) - The key name. If an array is given,
	the binding is applied to multiple keys. To learn about the name of
    a key combination, (e.g. `ctrl-t` or `f3`), type `ctrl-k` at the `nash`
    prompt, then the requested key combination, and the key name will be
    displayed, along with the registered handlers, if any.
- `code`: (Function) - The function to invoke when the key is pressed.
- `desc` (String) desc - A description of what the binding does.

When the end user types the bound key and the function provided in the
`code` parameter is invoked, it receives an object parameter with the
current editor line, split in the `left` and `right` properties with the
cursor in the middle.

The binding function can either be synchronous or asynchronous:
- If synchronous, it must return an object with a `left` and `right` string
    properties, which will be used to update the editor line. The prompt is
    not redisplayed for synchronous functions, unless the returned object
    also contains the `showPrompt` property set to `true`.

- If asynchronous, it must return a promise that will resolve when the bound
    function has finished running. The resolved object will contain the new
    line `left` and `right` properties. The prompt will be redisplayed upon
    the promise completion, unless the resolved line object also contains the
    `showPrompt` property set to `false`.

    Asynchronous bindings may need to handle keyboard input. Keyboard events
    can be obtained by calling the `onKeyPressed` function of the `editor`
    module and passing a listener function. The listener will be automatically
    discarded after the promise resolves.

#### `function unbindKey(kname, fname)`
Unbinds a previously bound key handler.

**Parameters**:
- `kname`: (String) - The key name, as passed in the `bindKey` function.
- `fname`: (String) - The name of the function to unbind.

#### `function getKeyBindings(kname)`
Returns an array with all the bindings registered via the `bindKey` function.

**Parameters**:
- `kname`: (String) - The key name, as passed in the `bindKey` function.

Each element in the array is an object with two properties that match the
second and third parameters of the `bindKey` function:
- `code`: the handler function
- `desc`: the description

#### `function getKeyBindingByFunction(fname)`
Returns the binding object (with the `code` and `desc` properties) for the
function with the given name.

**Parameters**:
- `fname`: (String) - The name of the function passed in the `bindKey` function.

### Line decoration

#### `function registerLineDecorator(decorator)`
Registers a *line decorator* function.

**Parameters**:
- `decorator`: (Function) - The decorator function

When the user is typing some text at the command prompt, `nash` invokes all
registered line decorator functions, so they can add color or text as required.
For example:
- The syntax highlight plugin decorates the command line by giving different colors
    to each part of the line depending on its purpose: command, file, option, quoted
    string, environment variable, redirection to file, etc.
- The suggestions plugin adds gray text at the end of the line, if there is a line
    in the history that starts with the current text.
- The sample `git-commit-len.js` plugin checks for a `git commit -m "..."` command
    and validates that the length of the message is not longer than a given limit,
    highlighting the extra length otherwise.

When invoked, the registered decorator function receives the following parameters:
- `plainLine`: the current command line, without any decoration. As multiple decorators
    can modify the command line, this text can be used to inspect the command line
    without the interference of other decorators.
- `decoratedLine`: the command line, after being potentially decorated by other
    registered decorators. This parameter should be used to add any custom decoration,
    so the effect of all decorators is accumulated.

The decorator function must return the resulting decorated line, i.e. with colors and/or
additional text, ready to be displayed. For adding color to text, `nash` provides the
`colors` module, which relies on the `chalk` package.

Decorators are invoked in the order they are registered, which corresponds with the
order in which the plugins are listed in the `plugins` array of `~/.nash/nashrc.js`.
If a given decorator needs to execute before others, the exported plugins array can
be rearranged accordingly.


### Command prompt

#### `function setPrompt(promptFunction)`
Sets the function that will be invoked for building the prompt string.

**Parameters**:
- `promptFunction`: (Function)  - The function that will be invoked whenever
    the prompt needs to be displayed. This function should return a string, which
    will be presented to the user when typing a command.

The prompt function receives a single object parameter with relevant
information about the environment, which can be optionally used by the
prompt function in order to build the prompt string.
The object properties are the following:
- **cwd**: the current working directory
- **username**: the current user name
- **hostname**: the host name
- **fqdn**: the fully qualified domain name of the host
- **retCode**: the return code of the most recent command
- **isRemote**: true if `nash` is acting on a remote connection
