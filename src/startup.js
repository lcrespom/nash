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


//------------------------------ Startup ------------------------------

function createNashDirIfRequired() {
    let nashDir = os.homedir() + '/.nash'
    if (!fs.existsSync(nashDir))
	    fs.mkdirSync(nashDir)
	createRC()
	copy2home('../examples/nashrc.js', 'nashrc.js')
	copy2home('../examples/agnoster-prompt.js', 'agnoster-prompt.js')
	copy2home('../examples/command-completion.js', 'command-completion.js')
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
