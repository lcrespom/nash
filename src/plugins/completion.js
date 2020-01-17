const glob = require('fast-glob')

const { cutLastChars } = require('../utils')
const { bindKey } = require('../nash-plugins')
const { parseBash, traverseAST, NodeType, builtins } = require('../parser')


//------------------------- AST Searching -------------------------

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
    if (!node) return [null, NodeType.unknown]
    if (node.type != 'Command') return [node.loc, NodeType.unknown]
    if (insideLoc(node.name.loc, pos)) return [node.name.loc, NodeType.command]
    if (!node.suffix) return [node.loc, NodeType.unknown]
    for (let s of node.suffix) {
        if (insideLoc(s.loc, pos)) {
            if (s.text[0] == '$')
                return [s.loc, NodeType.environment]
            else if (s.text[0] == '-')
                return [s.loc, NodeType.option]
            else
                return [s.loc, NodeType.parameter]
        }
    }
    return  [node.loc, NodeType.unknown]
}

function getWordAndType(line) {
    let pos = line.left.length - 1
    try {
        let ast = parseBash(line.left + line.right)
        let node = getNodeInPosition(ast, pos)
        let [loc, type] = getLocAndType(node, pos)
        if (type == NodeType.unknown)
            return ['', type]
        else
            return [line.left.substr(loc.start.char), type]
    }
    catch (err) {
        return ['', NodeType.unknown]
    }
}


//------------------------- Suggestions -------------------------

function safeGlob(paths, options) {
    try {
        return glob.sync(paths, options)
    }
    catch (err) {
        return []
    }
}

function getCommandSuggestions(word) {
    if (word.includes('/'))
        return getParameterSuggestions(word)
    let paths = process.env.PATH
        .split(':')
        .map(p => p + '/' + word + '*')
    return safeGlob(paths)
        .map(w => w.split('/').pop())
        .concat(builtins.filter(w => w.startsWith(word)))
}

function getParameterSuggestions(word) {
    if (!word.includes('*'))
        word += '*'
    return safeGlob(word, {
        onlyFiles: false,
        markDirectories: true,
        caseSensitiveMatch: false
    })
}

function getEnvironmentSuggestions(word) {
    return Object.keys(process.env)
        .map(w => '$' + w)
        .filter(w => w.startsWith(word))
        //TODO case-insensitive match
}

function getOptionSuggestions(word) {
    //TODO eventually provide extension points for completion
    return []
}

function getSuggestions(word, type) {
    switch (type) {
        case NodeType.unknown:
            return []
        case NodeType.command:
            return getCommandSuggestions(word)
        case NodeType.parameter:
            return getParameterSuggestions(word)
        case NodeType.environment:
            return getEnvironmentSuggestions(word)
        case NodeType.option:
            return getOptionSuggestions(word)
    }
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

module.exports = {
    completeWord,
    getWordAndType,
    NodeType
}