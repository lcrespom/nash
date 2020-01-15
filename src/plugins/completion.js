const { bindKey } = require('../nash-plugins')
const parse = require('bash-parser')


function traverseAST(node, nodeCB) {
    if (node.commands) {
        for (cmd of node.commands)
            traverseAST(cmd, nodeCB)
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
    if (node.type != 'Command') return null
    if (insideLoc(node.name.loc, pos)) return [node.name.loc, 'command']
    if (!node.suffix) return null
    for (let s of node.suffix)
        if (insideLoc(s.loc, pos)) return [s.loc, 'parameter']
    // TODO check suffix: expansion, file, etc
    return null
}

function getWordAndType(line) {
    let pos = line.left.length
    let ast = parse(line.left + line.right, { insertLOC: true })
    pos = Math.min(pos, ast.loc.end.char)
    let node = getNodeInPosition(ast, pos)
    let [loc, type] = getLocAndType(node, pos)
    return [line.left.substr(loc.start.char), type]
}



function completeWord(line) {
    if (line.left.length == 0) return line
    wat = getWordAndType(line)
    //TODO complete...
    return line
}


bindKey('tab', completeWord, 'Complete word under cursor')

module.exports = { completeWord, getWordAndType }