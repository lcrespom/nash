function unquote(str) {
	if (str.startsWith('"') && str.endsWith('"'))
		return str.substr(1, str.length - 2)
	if (str.startsWith("'") && str.endsWith("'"))
		return str.substr(1, str.length - 2)
	return str
}


function builtin_cd(args) {
	if (args.length > 2) {
		console.error('cd: too may arguments')
		return
	}
	if (args.length < 2) {
		// Do nothing
		return
	}
	let dir = args[1].text
	try {
		process.chdir(dir)
	}
	catch (err) {
		console.error(`cd: could not cd to '${dir}': ${err}`)
	}
}

function printAlias(name, value) {
	console.log(`${name}='${value}'`)
}

function getAlias(aname) {
	return aliases[aname]
}

function builtin_alias(args) {
	let prms = args.slice(1).map(arg => arg.text).join(' ')
	let match = prms.match(/([a-zA-Z0-9]+)=(.+)/)
	if (match) {
		// Set alias
		aliases[match[1]] = unquote(match[2])
	}
	else {
		if (prms.trim().length == 0) {
			// Print all aliases
			for (let k of Object.keys(aliases))
				printAlias(k, aliases[k])
		}
		else if (prms.match(/([a-zA-Z0-9]+)/)) {
			// Get alias
			let alias = aliases[prms]
			if (!alias) {
				//TODO set $? to 1
				return
			}
			printAlias(prms, alias)
		}
		else {
			console.error('alias: invalid syntax')
			return
		}
	}
}

let aliases = {}

let builtins = {
	cd: builtin_cd,
	alias: builtin_alias
}

function isBuiltin(bname) {
	return builtins[bname]
}

function runBuiltin(args) {
	let command = args[0].text
	let bfunc = builtins[command]
	if (!bfunc)
		throw new Error(`Builtin '${command}' not available`)
	bfunc(args)
}


module.exports = {
	isBuiltin,
	runBuiltin,
	getAlias
}
