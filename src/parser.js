const parse = require('bash-parser')

const NodeType = {
    unknown: 0,
    command: 1,
    parameter: 2,
    environment: 3,
    option: 4,
    quote: 5,
    comment: 6
}

const builtins = [
    "break", "cd", "continue", "eval", "exec", "exit", "export",
    "getopts", "hash", "pwd", "readonly", "return", "shift", "test",
    "times", "trap", "umask", "unset",
    "alias", "bind", "builtin", "caller", "command", "declare", "echo",
    "enable", "help", "let", "local", "logout", "mapfile", "printf",
    "read", "readarray", "source", "type", "typeset", "ulimit", "unalias"
].sort()


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

function parseBash(line) {
    return parse(line, { insertLOC: true })
}


module.exports = {
    NodeType,
    builtins,
    traverseAST,
    parseBash
}