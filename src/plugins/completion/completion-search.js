const path = require('path')

const {
    startsWithCaseInsensitive, cutLastChars, removeAnsiCodes
} = require('../../utils')
const {
    parseBash, traverseAST, NodeType, builtins
} = require('../../parser')
const env = require('../../env')
const colors = require('../../colors')
const docparser = require('./doc-parser')

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
            else
                return ['', NodeType.unknown]
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

function filename(nameAndDesc) {
    return nameAndDesc.split('##')[0]
}

async function safeGlob(paths, options) {
    try {
        if (!Array.isArray(paths)) paths = [paths]
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

async function getCommandCompletions(word, line, colors) {
    let words = []
    if (word.includes('/')) {
        words = await getParameterCompletions(word, line, colors)
    }
    else {
        let paths = process.env.PATH
            .split(path.delimiter)
            .map(p => p + '/' + word + '*')
            .filter(p => !p.includes('/node-gyp-bin/'))  // Mysterious bug
        words = (await safeGlob(paths))
            .map(p => colorizePathDesc(p, colors))
            .concat(builtins
                .filter(w => w.startsWith(word))
                .map(w => w + '##Bash reserved word')
            )
    }
    // Filter by dir or executable attribute
    return words.filter(w => {
        let desc = w.split('##')[1]
        if (!desc) return true  // builtin
        return removeAnsiCodes(desc).substr(0, 10).match(/[dlxs]/)
    })
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

function colorizePathDesc(p, colrs) {
    let [name, desc] = p.split('##')
    if (!desc) return p
    let regex = RegExp('[^ ]+','g')
    let m, matches = []
    // -rw-r--r--    1 user  group   1.1K Jan 26 08:12
    while (m = regex.exec(desc)) matches.push(m)
    let idx = matches.map(m => m.index)
    let attrs = colors.colorize(colrs.attrs, desc.substring(0, idx[2]))
    let user = colors.colorize(colrs.user, desc.substring(idx[2], idx[4]))
    let size = colors.colorize(colrs.size, desc.substring(idx[4], idx[5]))
    let date = colors.colorize(colrs.date, desc.substr(idx[5]))
    return name + '##' + attrs + user + size + date
}

async function getMatchingDirsAndFiles(word, line, colors) {
    let dirsAndFiles = await safeGlob(word)
    dirsAndFiles = dirsAndFiles
        .map(p => colorizePathDesc(p, colors))
    // Put directories first, then files
    let dirs = dirsAndFiles.filter(p => filename(p).endsWith('/'))
    dirs = prependParentDir(dirs, word)
    if (line.left.match(/^cd [^;&]*$/))
        return dirs
    let files = dirsAndFiles.filter(p => !filename(p).endsWith('/'))
    return dirs.concat(files)
}

async function getParameterCompletions(word, line, colors) {
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
    return await getMatchingDirsAndFiles(word, line, colors)
}

function getEnvironmentCompletions(word) {
    return Object.keys(process.env)
        .filter(w => startsWithCaseInsensitive('$' + w, word))
        .sort()
        .map(w => '$' + w + '##' + process.env[w])
}

optsCache = {}

function getCommandAndSubcommands(line) {
    // Handle multiple commands, e.g. with |, ;, ||, &&
    line = line.split('|').pop().split(';').pop().split('&').pop().trim()
    let cmds = line.split(' ')
    let idx = cmds.findIndex(cmd => !cmd.match(/^[a-z][a-z\-]*$/))
    if (idx == 0) return cmds[0]
    if (idx > 0) cmds = cmds.slice(0, idx)
    return cmds.join(' ')
}

async function getOptionCompletions(word, line) {
    let cmd = getCommandAndSubcommands(line.left)
    let opts = optsCache[cmd]
    if (!opts) {
        opts = await docparser.parseOptions(cmd)
        optsCache[cmd] = opts
    }
    return opts.filter(w => startsWithCaseInsensitive(w, word))
}

async function getCompletions(word, type, line, colors) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return await getCommandCompletions(word, line, colors)
        case NodeType.redirect:
        case NodeType.parameter:
            return await getParameterCompletions(word, line, colors)
        case NodeType.environment:
            return getEnvironmentCompletions(word)
        case NodeType.option:
            return getOptionCompletions(word, line)
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