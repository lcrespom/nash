const path = require('path')

const { startsWithCaseInsensitive, cutLastChars } = require('../../utils')
const {
    parseBash, traverseAST, NodeType, builtins
} = require('../../parser')
const env = require('../../env')

let customCommands = {}


//------------------------- AST Searching -------------------------

function insideLoc(loc, pos) {
    return loc.start.char <= pos && pos <= loc.end.char
}

function getNodeInPosition(ast, pos) {
    let node = null
    traverseAST(ast, n => {
        if (insideLoc(n.loc, pos)) {
            node = n
        }
    })
    return node
}

function getLocAndType(node, pos) {
    if (!node)
        return [null, NodeType.unknown]
    if (node.type != 'Command')
        return [node.loc, NodeType.unknown]
    if (insideLoc(node.name.loc, pos))
        return [node.name.loc, NodeType.command]
    if (!node.suffix)
        return [node.loc, NodeType.unknown]
    for (let s of node.suffix) {
        if (insideLoc(s.loc, pos)) {
            if (s.type == 'Redirect') {
                if (s.file && insideLoc(s.file.loc, pos))
                    return [s.file.loc, NodeType.redirect]
                else return s.loc
            }
            else if (s.text[0] == '$')
                return [s.loc, NodeType.environment]
            else if (s.text[0] == '-')
                return [s.loc, NodeType.option]
            else
                return [s.loc, NodeType.parameter]
        }
    }
    return [node.loc, NodeType.unknown]
}

function isEmptyParameter(line) {
    return line.left.trim().length > 0
        && line.left.endsWith(' ')
        && line.right == ''
}

function isEmptyRedirect(line) {
    let l = line.left.trim()
    return l.endsWith('<') || l.endsWith('>') && line.right == ''
}

function getWordAndType(line) {
    let pos = line.left.length - 1
    try {
        let ast = parseBash(line.left + line.right)
        let node = getNodeInPosition(ast, pos)
        let [loc, type] = getLocAndType(node, pos)
        if (loc == null) {
            if (isEmptyParameter(line))
                return ['', NodeType.parameter]
            else if (isEmptyRedirect(line))
                return ['', NodeType.redirect]
        }
        else if (type == NodeType.unknown)
            return ['', type]
        else
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', NodeType.unknown]
    }
}


//------------------------- Completion search -------------------------

async function safeGlob(paths, options) {
    try {
        if (!Array.isArray(paths))
		paths = [paths]
    	let result = []
	    for (let path of paths) {
            result = result.concat(await env.glob(path, options))
        }
        return result
    }
    catch (err) {
        return []
    }
}

async function getCommandCompletions(word, line) {
    if (word.includes('/'))
        // Should filter by executable attribute
        return getParameterCompletions(word, line)
    let paths = process.env.PATH
        .split(path.delimiter)
        .map(p => p + '/' + word + '*')
    let words = await safeGlob(paths)
    return words.map(w => w.split('/').pop())
        .concat(builtins.filter(w => w.startsWith(word)))
}

function getSubcommandCompletions(word, line) {
    // Notice: does not support commands after ";", "|", "&&", etc.
    let command = cutLastChars(line.left, word.length).trim()
    let subCommands = customCommands[command]
    if (!subCommands)
        return null
    if (subCommands instanceof Function)
        return subCommands(command, word, line)
    else
        return subCommands.filter(sc => startsWithCaseInsensitive(sc, word))
}

function prependParentDir(dirs, word) {
    // User is typing the pattern
    if (!word.endsWith('*'))
        return dirs
    // Root directory
    if (word.startsWith('/') && word.split('/').length <= 2)
        return dirs
    // Remove the trailing '*'
    let parent = word.slice(0, -1)
    // Current directory
    if (parent.length == 0)
        return ['../'].concat(dirs)
    // Not a directory name
    if (!parent.endsWith('/'))
        return dirs
    // Remove redundant ../
    let d = env.cwd()
    d = d.replace(/^~/, env.homedir())
    d = path.normalize(path.join(d, parent))
    if (d == '/')
        return dirs
    return [parent + '../'].concat(dirs)
}

async function getMatchingDirsAndFiles(word, homedir, line) {
    let dirsAndFiles = await safeGlob(word)
    dirsAndFiles = dirsAndFiles.map(p => env.pathFromHome(p, homedir))
    // Put directories first, then files
    let dirs = dirsAndFiles.filter(p => p.endsWith('/'))
    dirs = prependParentDir(dirs, word)
    if (line.left.match(/^cd [^;&]*$/))
        return dirs
    let files = dirsAndFiles.filter(p => !p.endsWith('/'))
    return dirs.concat(files)
}

async function getParameterCompletions(word, line) {
    // Special case: configured subcommand
    let subCommands = getSubcommandCompletions(word, line)
    if (subCommands)
        return subCommands
        // Accomodate word to glob
    let homedir = env.homedir()
    word = word.replace(/\\ /g, ' ')
    if (word.startsWith('~/'))
        word = homedir + word.substr(1)
    if (!word.includes('*'))
        word += '*'
    // Perform glob
    return await getMatchingDirsAndFiles(word, homedir, line)
}

function getEnvironmentCompletions(word) {
    return Object.keys(process.env)
        .map(w => '$' + w)
        .filter(w => startsWithCaseInsensitive(w, word))
}

function getOptionCompletions(word) {
    //TODO provide general extension points for completion
    return []
}

async function getCompletions(word, type, line) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return await getCommandCompletions(word, line)
        case NodeType.redirect:
        case NodeType.parameter:
            return await getParameterCompletions(word, line)
        case NodeType.environment:
            return getEnvironmentCompletions(word)
        case NodeType.option:
            return getOptionCompletions(word)
    }
}

function setCustomCommands(cc) {
    customCommands = cc
}


module.exports = {
    getWordAndType,
    getCompletions,
    setCustomCommands
}