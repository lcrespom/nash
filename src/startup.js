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

function copy2home(source, target) {
	let targetPath = os.homedir() + '/.nash/' + target
	if (fs.existsSync(targetPath)) return
	let content = fs.readFileSync(require.resolve(source))
	fs.writeFileSync(targetPath, content)
}

function copyExamples(examples) {
	for (let example of examples)
		copy2home('../examples/' + example, example)
}


//------------------------------ Options ------------------------------

let userConfig = {
	options: {}
}

function getOption(name) {
	return getProp(userConfig.options, name)
}

function setOption(name, obj) {
	setProp(userConfig.options, name, obj)
}


//------------------------------ Startup ------------------------------

function setDefaultOptions(name, defaultOptions) {
    let userOptions = getOption(name)
    setOption(name, { ...defaultOptions, ...userOptions })
}

function createNashDirIfRequired() {
    let nashDir = os.homedir() + '/.nash'
    if (!fs.existsSync(nashDir))
	    fs.mkdirSync(nashDir)
	createRC()
	copyExamples(['nashrc.js', 'agnoster-prompt.js',
		'command-completion.js', 'custom-keys.js'])
}

function loadPlugin(pname) {
	return require(pname)
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

let pluginModules = []

function loadPlugins(plugins) {
	let modules = []
	for (let plugin of plugins) {
		if (plugin.startsWith('.'))
			plugin = os.homedir() + '/.nash/' + plugin
		else
			plugin = './plugins/' + plugin
		modules.push(loadPlugin(plugin))
	}
	return modules
}

function startPlugins(plugins) {
	for (let i = 0; i < plugins.length; i++) {
		let module = pluginModules[i]
		if (module && module.start) {
			//console.log('Starting ' + plugins[i])
			module.start()
		}
	}
}

function getWelcomeMessage() {
	let defaultMsg = 'Welcome to nash (https://github.com/lcrespom/nash)\n' +
		'Press F1 for help on keyboard commands'
	let greeting = getOption('greeting')
	if (greeting === undefined) greeting = defaultMsg
	if (greeting.length > 0) greeting += '\n'
	return greeting
}

function createGlobals() {
	// Expose global variables so custom extensions can require nash modules
	global.NASH_BASE = __dirname
	global.NODE_MODULES = __dirname + '/../node_modules'	
}

function nashStartup() {
	createGlobals()	
	createNashDirIfRequired()
	userConfig = loadNashRCJS()
	if (userConfig.options === undefined)
		userConfig.options = {}
	let plugins = userConfig.plugins
	pluginModules = loadPlugins(plugins)
	startPlugins(plugins)
	process.stdout.write(getWelcomeMessage())
}

function nashShutdown() {
	for (let module of pluginModules)
		if (module && module.stop)
			module.stop()
}


module.exports = {
	userConfig,
	getOption,
	setOption,
	setDefaultOptions,
	nashStartup,
	nashShutdown
}
