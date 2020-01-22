const { execFileSync } = require('child_process')

function runCommand(cmd) {
    try {
        let args = cmd.split(' ')
        let options = { stdio: ['ignore', 'pipe', 'ignore'] }
        return execFileSync(args[0], args.slice(1), options)
            .toString()
    }
    catch (err) {
        return ''
    }
}

function parseBranch(line) {
    if (!line.startsWith('## '))
        return null
    return line.substr(3).split('...')[0]
}

function parseRemoteBranch(branch, line) {
    let result = { ahead: 0, behind: 0 }
    if (!branch)
        return result
    let m = line.match(/\[(ahead|behind) (\d+)\]$/)
    if (!m)
        return result
    result[m[1]] = parseInt(m[2], 10)
    return result
}

function updateCounter(ctrs, code) {
    let c2f = {
        M: 'modified', U: 'updated', A: 'added', R: 'renamed', '?': 'untracked'
    }
    let prop = c2f[code]
    if (!prop || ctrs[prop] === undefined) return
    ctrs[prop]++
}

function totalCounters(ctrs) {
    let total  = 0
    for (let k of Object.keys(ctrs))
        total += ctrs[k]
    ctrs.total = total
}

function isConflict(line) {
    let xy = line.substr(0, 2)
    return 'DD-AU-UD-UA-DU-AA-UU'.includes(xy)
}

function parseGitStatus(lines) {
    let branch = parseBranch(lines[0])
    let { ahead, behind } = parseRemoteBranch(branch, lines[0] )
    let index = { modified: 0, updated: 0, added: 0, renamed: 0 }
    let tree = { ...index, untracked: 0 }
    let conflicts = 0
    lines = lines.slice(1)
    for (let line of lines) {
        if (isConflict(line)) {
            conflicts++
        }
        else {
            updateCounter(index, line[0])
            updateCounter(tree, line[1])
        }
    }
    totalCounters(index)
    totalCounters(tree)
    let dirty = conflicts + index.total + tree.total > 0 
    return { branch, index, tree, conflicts, dirty, ahead, behind }
}

function gitStatus() {
    let lines = runCommand('git status --porcelain -b')
        .trim().split('\n')
    if (lines.length == 0 || !lines[0])
        return null
    return parseGitStatus(lines)
}

function gitStatusFlags(status) {
    if (!status) return ''
    let flags = ''
    if (status.ahead) flags += '↑'
    if (status.behind) flags += '↓'
    if (status.tree.total) flags += '●'
    if (status.index.total) flags += '✚'
    if (status.conflicts) flags += '✖'
    return flags
} 

module.exports = {
    gitStatus,
    gitStatusFlags
}
