const fs = require('fs')
const os = require('os')
const path = require('path')

const { getProp, setProp } = require('./utils')

const NASH_DIR = '.nash'

//------------------------------ RC files ------------------------------

function getLsOptions() {
	if (process.platform === 'darwin') return '-G'
	else return '--color=auto'
}

function createRC(rcname) {
	const NASH_RC = `# nash init file
# Place here any bash initialization commands

# Do NOT remove the next two lines - they are required for nash to work properly
PS1=$'\\x1E\\x1E>'
HISTCONTROL="ignorespace"

# Enable colors in ls command
alias ls="ls ${getLsOptions()}"
`
	fs.writeFileSync(rcname, NASH_RC)
}

function copyFiles(fromDir, toDir) {
	let files = fs.readdirSync(fromDir)
	for (let file of files) {
		let content = fs.readFileSync(path.join(fromDir, file))
		fs.writeFileSync(path.join(toDir, file), content)
	}
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
	let nashDir = path.join(os.homedir(), NASH_DIR)
	// Check if ~/.nash exists
	if (fs.existsSync(nashDir)) return	// Nash is already installed
	// Perform initial installation - check if examples dir exists
	let exdir = path.join(path.dirname(__dirname), 'examples')
	if (!fs.existsSync(exdir)) {
		throw new Error(
			'Nash installation error: could not find examples ' +
			'directory at\n    ' + exdir + '\n')
	}
	// Everything is ready for installation
	fs.mkdirSync(path.join(nashDir, 'history'), { recursive: true })
	createRC(path.join(nashDir, 'nashrc'))
	copyFiles(exdir, nashDir)
}

function loadPlugin(pname) {
	return require(pname)
}

function loadNashRCJS() {
	let rcname = path.join(os.homedir(), NASH_DIR, 'nashrc.js')
	if (!fs.existsSync(rcname))
		throw new Error('Error: ~/.nash/nashrc.js not found')
	let rcexports = loadPlugin(rcname)
	if (!rcexports.plugins)
		throw new Error('Error: ~/.nash/nashrc.js should export a `plugins` array')
	return rcexports
}

let pluginModules = []

function loadPlugins(plugins) {
	let modules = []
	for (let plugin of plugins) {
		if (plugin.startsWith('.'))
			plugin = path.join(os.homedir(), NASH_DIR, plugin)
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
	let { version } = require('../package.json')
	let defaultMsg = `Welcome to nash ${version} ` +
		'(https://github.com/lcrespom/nash)\n' +
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
	getOption,
	setOption,
	setDefaultOptions,
	nashStartup,
	nashShutdown
}
