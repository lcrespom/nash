const parse = require('bash-parser')

const { reverseObject } = require('./utils')

const NodeType = {
    unknown: 0,
    // Commands
    command: 1, // Generic command (any of the following)
    program: 2,
    builtin: 3,
    alias: 4,
    commandError: 5,
    // Assignment
    assignment: 6,
    // Redirect
    redirect: 7,
    // Parameters in different formats
    parameter: 8,
    environment: 9,
    option: 10,
    quote: 11,
    // Comments
    comment: 12
}

const NodeTypeNames = reverseObject(NodeType)

const builtins = [
    'alias', 'alloc',
    'bg', 'bind', 'bindkey', 'break', 'breaksw', 'builtins',
    'case', 'cd', 'chdir', 'command', 'complete', 'continue',
    'default', 'dirs', 'do', 'done',
    'echo', 'echotc', 'elif', 'else', 'end', 'endif', 'endsw',
    'esac', 'eval', 'exec', 'exit', 'export',
    'false', 'fc', 'fg', 'filetest', 'fi', 'for', 'foreach',
    'getopts', 'glob', 'goto',
    'hash', 'hashstat', 'history', 'hup',
    'if',
    'jobid', 'jobs',
    'kill',
    'limit', 'local', 'log', 'login', 'logout',
    'nice', 'nohup', 'notify',
    'onintr',
    'popd', 'printenv', 'pushd', 'pwd',
    'read', 'readonly', 'rehash', 'repeat', 'return',
    'sched', 'set', 'setenv', 'settc', 'setty', 'setvar', 'shift',
    'source', 'stop', 'suspend', 'switch',
    'telltc', 'test', 'then', 'time', 'times', 'trap', 'true', 'type',
    'ulimit', 'umask', 'unalias', 'uncomplete', 'unhash', 'unlimit',
    'unset', 'unsetenv', 'until',
    'wait', 'where', 'which', 'while'
]


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
    if (!line) return null 
    try {
        return parse(line, { insertLOC: true })
    }
    catch (e) {
        if (e.message.startsWith('Unclosed ')) {
            let endQuote = e.message.charAt(e.message.length - 1)
            if (endQuote == '(') endQuote = 'x)'
            else endQuote = 'a' + endQuote
            try {
                return parse(line + endQuote, { insertLOC: true })
            }
            catch (ee) {
                // Desperately trying to do partial parsing
                return parseBash(line.substr(0, line.length - 4))
            }
        }
        line = line.substr(0, line.length - 1)
        if (line.length == 0)
            return null
        return parseBash(line)
    }
}


module.exports = {
    NodeType,
    NodeTypeNames,
    builtins,
    traverseAST,
    parseBash
}
