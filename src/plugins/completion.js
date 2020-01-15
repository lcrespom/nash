const parse = require('bash-parser')
const glob = require('fast-glob')

const { bindKey } = require('../nash-plugins')


const SuggestType = {
    unknown: 'unknown',
    command: 'command',
    parameter: 'parameter',
    environment: 'environment'
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

function getCommandSuggestions(word) {
    return  [word + 'command']
}

function getParameterSuggestions(word) {
    if (word.startsWith('-'))
        return [word]
    // Get all files that start with 'word'
    //  'word' can be a relative or absolute path, even a glob
    if (!word.includes('*'))
        word += '*'
    return glob.sync(word, { onlyFiles: false, markDirectories: true })
}

function getEnvironmentSuggestions(word) {
    return [word + 'environment']
}

function getSuggestions(word, type) {
    if (type == SuggestType.parameter && word[0] == '$')
        //TODO improve environment expansion detection
        type = SuggestType.environment
    switch (type) {
        case SuggestType.unknown: return []
        case SuggestType.command: return getCommandSuggestions(word)
        case SuggestType.parameter: return getParameterSuggestions(word)
        case SuggestType.environment: return getEnvironmentSuggestions(word)
    }
}

function cutLastChars(str, numch) {
    return str.substr(0, str.length - numch)
}


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