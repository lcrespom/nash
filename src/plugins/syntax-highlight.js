const parse = require('bash-parser')


const NodeType = {
    unknown: 'unknown',
    command: 'command',
    parameter: 'parameter',
    environment: 'environment',
    option: 'option',
    quote: 'quote',     //TODO implement detection
    comment: 'comment'  //TODO implement detection
}

function traverseAST(node, nodeCB) {
    // TODO improve by adding more complex cases
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

function makeHL(type, loc) {
    return {
        type,
        start: loc.start.char,
        end: loc.end.char
    }
}

function highlightNode(node, hls, line) {
    if (node.type != 'Command')
        return
    hls.push(makeHL(NodeType.command, node.name.loc))
    if (!node.suffix)
        return
    for (let s of node.suffix) {
        let type = NodeType.parameter
        if (s.text[0] == '$')
            type = NodeType.environment
        else if (s.text[0] == '-')
            type = NodeType.option
        hls.push(makeHL(type, s.loc))
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
    let ast = parse(line, { insertLOC: true })
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
