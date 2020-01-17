const { parseBash, traverseAST, NodeType } = require('../parser')


function makeHL(type, loc) {
    return {
        type,
        start: loc.start.char,
        end: loc.end.char
    }
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
    hls.push(makeHL(NodeType.command, node.name.loc))
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


module.exports = {
    NodeType,
    highlight
}
