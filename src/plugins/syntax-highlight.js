const { execFileSync } = require('child_process')
const chalk = require('chalk')

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
    if (node.prefix)
        for (let p of node.prefix)
            hls.push(makeHL(NodeType.assignment, p.loc))
    if (node.name)
        hls.push(makeHL(getCommandType(node.name.text), node.name.loc))
    if (node.suffix)
        for (let s of node.suffix)
            hls.push(makeHL(getSuffixType(s, line), s.loc))
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
    if (!ast)
        return hls
    traverseAST(ast, n => {
        highlightNode(n, hls, line)
    })
    highlightComment(line, ast, hls)
    return hls
}

function applyColor(chunk, hl) {
    const colors = [
        'reset',
        'green', 'green', 'green', 'redBright',
        'magentaBright',
        'cyan', 'magenta', 'cyanBright', 'yellow',
        'blue'
    ]
    let colorName = colors[hl.type]
    return chalk[colorName](chunk)
}

function colorize(line, hls, colorFunc = applyColor) {
    if (hls.length == 0)
        return line
    let pos = 0
    let result = ''
    // debugger
    for (let hl of hls) {
        if (pos < hl.start) {
            result += line.substring(pos, hl.start)
        }
        let chunk = line.substring(hl.start, hl.end + 1)
        result += colorFunc(chunk, hl)
        pos = hl.end + 1
    }
    lastHL = hls.pop()
    result += line.substr(lastHL.end + 1)
    return result
}


registerLineDecorator((plainLine, decoratedLine) => {
    if (plainLine == '') {
        //getCommandTypeFromCache = memoize(getCommandType)
        return decoratedLine
    }
    let hls = highlight(plainLine)
    return colorize(plainLine, hls)
})


// Exports used only for testing
module.exports = {
    NodeType,
    highlight,
    colorize
}
