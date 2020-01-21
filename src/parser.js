const parse = require('bash-parser')

const NodeType = {
    unknown: 0,
    // Commands
    command: 1,
    program: 1,
    builtin: 2,
    alias: 3,
    commandError: 4,
    // Assignment
    assignment: 5,
    // Parameters in different formats
    parameter: 6,
    environment: 7,
    option: 8,
    quote: 9,
    // Comments
    comment: 10
}

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
    try {
        return parse(line, { insertLOC: true })
    }
    catch (e) {
        if (e.message.startsWith('Unclosed ')) {
            let endQuote = e.message.charAt(e.message.length - 1)
            if (endQuote == '(')
                endQuote = 'x)'
            return parse(line + endQuote, { insertLOC: true })
        }
        line = line.substr(0, line.length - 1)
        if (line.length == 0)
            return null
        return parseBash(line)
    }
}


module.exports = {
    NodeType,
    builtins,
    traverseAST,
    parseBash
}