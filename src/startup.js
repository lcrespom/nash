const fs = require('fs')
const os = require('os')

const { getProp, setProp } = require('./utils')


//------------------------------ RC files ------------------------------

function getLsOptions() {
	if (process.platform === 'darwin') return '-G'
	else return '--color=auto'
}

function createRC() {
	const NASH_RC = `# nash init file
# Place here any bash initialization commands

# Do NOT remove the next two lines - they are required for nash to work properly
PS1=$'\\x1E\\x1E>'
HISTCONTROL="ignorespace"

# Enable colors in ls command
alias ls="ls ${getLsOptions()}"
`
	let rcname = os.homedir() + '/.nash/nashrc'
	if (fs.existsSync(rcname)) return
	fs.writeFileSync(rcname, NASH_RC)
}

function createRCJS() {
	const NASH_RC_JS = `/*
This file is automcatically loaded during startup. It can be used to execute
any arbitrary JS code.
The exported plugin array is used to load configurable features. The are
all optional, other than 'default-bindings'. Custom plugins can also be
loaded by using relative paths, e.g. './my-plugin'.
*/

module.exports = {
    plugins: [
        'default-bindings',
        'default-prompt',
        'completion',
        'syntax-highlight',
        'suggestions'
    ]
}
`
	let rcjsname = os.homedir() + '/.nash/nashrc.js'
	if (fs.existsSync(rcjsname)) return
	fs.writeFileSync(rcjsname, NASH_RC_JS)
}


//------------------------------ Startup ------------------------------

function createNashDirIfRequired() {
    let nashDir = os.homedir() + '/.nash'
    if (fs.existsSync(nashDir)) return
    fs.mkdirSync(nashDir)
	createRC()
	createRCJS()
}

function loadPlugin(pname) {
	return require(pname)
}

function loadPlugins(plugins) {
	for (let plugin of plugins) {
		if (plugin.startsWith('.'))
			plugin = os.homedir() + '/.nash/' + plugin
		else
			plugin = './plugins/' + plugin
		loadPlugin(plugin)
	}
}

function loadNashRCJS() {
	let rcname = os.homedir() + '/.nash/nashrc.js'
	if (!fs.existsSync(rcname)) {
		console.error('Error: ~/.nash/nashrc.js not found')
		process.exit(2)
	}
	let rcexports = loadPlugin(rcname)
	if (!rcexports.plugins) {
		console.error('Error: ~/.nash/nashrc.js should export a `plugins` array')
		process.exit(3)
	}
	return rcexports
}


let userConfig = {
	options: {}
}

function getOption(name) {
	return getProp(userConfig.options, name)
}

function setOption(name, obj) {
	setProp(userConfig.options, name, obj)
}

function setDefaultOptions(name, defaultOptions) {
    let userOptions = getOption(name)
    setOption(name, { ...defaultOptions, ...userOptions })
}

function nashStartup() {
	createNashDirIfRequired()
	userConfig = loadNashRCJS()
	if (userConfig.options === undefined)
		userConfig.options = {}
	let plugins = userConfig.plugins
	loadPlugins(plugins)
}

module.exports = {
	nashStartup,
	userConfig,
	getOption,
	setOption,
	setDefaultOptions
}
