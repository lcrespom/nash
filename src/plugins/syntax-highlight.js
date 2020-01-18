const { execFileSync } = require('child_process')

const { registerLineDecorator } = require('../editor')
const {
    NodeType, builtins, parseBash, traverseAST
} = require('../parser')


function makeHL(type, loc) {
    return {
        type,
        start: loc.start.char,
        end: loc.end.char
    }
}

function which(command) {
	try {
		return execFileSync('/usr/bin/which', [ command ]).toString().trim()
	}
	catch (e) {
		return null
	}
}

function getCommandType(cmd) {
    //TODO memoize this function, clean cache when line is empty
    if (builtins.includes(cmd))
        return NodeType.builtin
    let whichOut = which(cmd)
    if (!whichOut)
        return NodeType.commandError
    if (whichOut.endsWith('shell built-in command'))
        return NodeType.builtin
    if (whichOut.includes(': aliased to '))
        return NodeType.alias
    return NodeType.program
}

function getSuffixType(s, line) {
    if (s.text[0] == '$')
        return NodeType.environment
    if (s.text[0] == '-')
        return NodeType.option
    let ch = line[s.loc.start.char]
    if (ch == '"' || ch == "'")
        return NodeType.quote
    return NodeType.parameter
}

function highlightNode(node, hls, line) {
    if (node.type != 'Command')
        return
    hls.push(makeHL(getCommandType(node.name.text), node.name.loc))
    if (!node.suffix)
        return
    for (let s of node.suffix) {
        hls.push(makeHL(getSuffixType(s, line), s.loc))
    }
}

function highlightComment(line, ast, hls) {
    let extra = line.substr(ast.loc.end.char + 1)
    if (extra.trim().startsWith('#')) {
        let pos = ast.loc.end.char + 1
        hls.push({
            type: NodeType.comment,
            start: line.indexOf('#', pos),
            end: line.length - 1
        })
    }
}

function highlight(line) {
    let ast = parseBash(line)
    let hls = []
    traverseAST(ast, n => {
        highlightNode(n, hls, line)
    })
    highlightComment(line, ast, hls)
    return hls
}

registerLineDecorator((plainLine, pdl) => {
    return pdl  //TODO perform highlight
})


module.exports = {
    NodeType,
    highlight
}
