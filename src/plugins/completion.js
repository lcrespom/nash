const parse = require('bash-parser')
const glob = require('fast-glob')

const { bindKey } = require('../nash-plugins')


//------------------------- AST Searching -------------------------

const SuggestType = {
    unknown: 'unknown',
    command: 'command',
    parameter: 'parameter',
    environment: 'environment',
    option: 'option'
}

function traverseAST(node, nodeCB) {
    if (node.commands) {
        for (cmd of node.commands)
            traverseAST(cmd, nodeCB)
    }
    else if (node.type == 'LogicalExpression') {
        traverseAST(node.left, nodeCB)
        traverseAST(node.right, nodeCB)
    }
    else {
        nodeCB(node)
    }
}

function insideLoc(loc, pos) {
    return loc.start.char <= pos && pos <= loc.end.char
}

function getNodeInPosition(ast, pos) {
    let node = null
    let minDist = Number.MAX_VALUE
    traverseAST(ast, n => {
        if (insideLoc(n.loc, pos)) {
            node = n
        }
    })
    return node
}

function getLocAndType(node, pos) {
    if (!node) return [null, SuggestType.unknown]
    if (node.type != 'Command') return [node.loc, SuggestType.unknown]
    if (insideLoc(node.name.loc, pos)) return [node.name.loc, SuggestType.command]
    if (!node.suffix) return [node.loc, SuggestType.unknown]
    for (let s of node.suffix)
        if (insideLoc(s.loc, pos)) return [s.loc, SuggestType.parameter]
    // TODO check suffix: expansion, file, etc
    return  [node.loc, SuggestType.unknown]
}

function getWordAndType(line) {
    let pos = line.left.length - 1
    try {
        let ast = parse(line.left + line.right, { insertLOC: true })
        let node = getNodeInPosition(ast, pos)
        let [loc, type] = getLocAndType(node, pos)
        if (type == SuggestType.unknown)
            return ['', type]
        else
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', SuggestType.unknown]
    }
}


//------------------------- Suggestions -------------------------

const builtins = [
    "break", "cd", "continue", "eval", "exec", "exit", "export",
    "getopts", "hash", "pwd", "readonly", "return", "shift", "test",
    "times", "trap", "umask", "unset",
    "alias", "bind", "builtin", "caller", "command", "declare", "echo",
    "enable", "help", "let", "local", "logout", "mapfile", "printf",
    "read", "readarray", "source", "type", "typeset", "ulimit", "unalias"
].sort()

function getCommandSuggestions(word) {
    let paths = process.env.PATH
        .split(':')
        .map(p => p + '/' + word + '*')
    return glob.sync(paths)
        .map(w => w.split('/').pop())
        .concat(builtins.filter(w => w.startsWith(word)))
}

function getParameterSuggestions(word) {
    if (!word.includes('*'))
        word += '*'
    return glob.sync(word, { onlyFiles: false, markDirectories: true })
}

function getEnvironmentSuggestions(word) {
    return Object.keys(process.env)
        .map(w => '$' + w)
        .filter(w => w.startsWith(word))
}

function getOptionSuggestions(word) {
    //TODO eventually provide extension points for completion
    return []
}

function getSuggestions(word, type) {
    if (type == SuggestType.parameter) {
        if (word[0] == '$') {
            //TODO improve environment expansion detection
            type = SuggestType.environment
        }
        else if (word[0] == '-') {
            type = SuggestType.option
        }
    }
    switch (type) {
        case SuggestType.unknown:
            return []
        case SuggestType.command:
            return getCommandSuggestions(word)
        case SuggestType.parameter:
            return getParameterSuggestions(word)
        case SuggestType.environment:
            return getEnvironmentSuggestions(word)
        case SuggestType.option:
            return getOptionSuggestions(word)
    }
}

function cutLastChars(str, numch) {
    return str.substr(0, str.length - numch)
}


//------------------------- Key binding -------------------------

function completeWord(line) {
    if (line.left.length == 0) return line
    let [word, type] = getWordAndType(line)
    words = getSuggestions(word, type)
    if (words.length == 0) {
        return line
    }
    if (words.length == 1) {
        return {
            left: cutLastChars(line.left, word.length) + words[0],
            right: line.right
        }
    }
    else {
        //TODO show options, let user navigate
        return line
    }
}


bindKey('tab', completeWord, 'Complete word under cursor')

module.exports = { completeWord, getWordAndType }