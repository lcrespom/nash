const parse = require('bash-parser')

const NodeType = {
    unknown: 0,
    // Commands
    command: 1,
    program: 1,
    builtin: 2,
    alias: 3,
    commandError: 4,
    // Parameters in different formats
    parameter: 5,
    environment: 6,
    option: 7,
    quote: 8,
    // Comments
    comment: 9
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