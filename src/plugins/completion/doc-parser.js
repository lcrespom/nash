const { runHiddenCommand } = require('../../runner')


function commandOut2Array(out) {
	let arr = out.trim().split('\n')
	let rc = arr.pop()
	return rc === '0' ? arr : []
}

async function runCommand(cmd) {
    let out = await runHiddenCommand(`${cmd} | cat; echo $?`)
    return commandOut2Array(out)
}

function getManOut(cmd) {
    return runCommand('man ' + cmd.replace(/ /g, '-'))
}

function removeBackChars(str) {
    let result = ''
    for (let i = 0; i < str.length; i++) {
        let c = str.charAt(i)
        if (i == 0 || c != '\b')
            result += c
        else
            result = result.slice(0, -1)
    }
    return result
}

function isOptionsHeader(line) {
    return line == 'OPTIONS' ||
        line.trim() == 'The following options are available:' ||
        line.trim() == 'The options are as follows:'
}

function cleanOpt(opt) {
    return { name: opt.name, desc: opt.desc.trim() }
}

function parseManLine(line, lastLine, opt, opts) {
    if (line.startsWith('-') && lastLine.length == 0) {
        if (opt) opts.push(cleanOpt(opt))
        let p = line.indexOf('    ')
        opt = { name: line, desc: '' }
        if (p > 0 && !line.substr(0, p).includes(' ')) {
            opt.name = line.substr(0, p)
            opt.desc = line.substr(p).trim()
        }
    }
    else if (opt) {
        if (line.length == 0) {
            opt.done = true
        }
        else if (!opt.done) opt.desc += '\n' + line
    }
    return opt
}

function parseMan(lines) {
    if (!lines || lines.length == 0) return []
    let opts = []
    let opt = null
    let inOptions = false
    let lastLine = ''
    for (let line of lines) {
        line = removeBackChars(line)
        if (!inOptions) {
            if (isOptionsHeader(line)) {
                inOptions = true
                continue
            }
        }
        else {
            if (line.length > 0 && line[0] != ' ') break
            line = line.trim()
            opt = parseManLine(line, lastLine, opt, opts)
        }
        lastLine = line
    }
    if (opt) opts.push(cleanOpt(opt))
    return opts
}

async function parseOptions(cmd) {
    let out = await getManOut(cmd)
    out = out.map(l => l.trimRight())
    return parseMan(out).map(opt => opt.name + '##' + opt.desc)
}

function wrap(str, w, maxLines) {
    if (!str) return str
    if (str.charCodeAt(0) < 32) return str  // Colorized, can't wrap
    // Remove hypthens and put everything in a single line
    str = str.replace(/([a-z])-\n/g, '$1').split('\n').join(' ')
    // Split in lines of maximum `w` characters
    let rexp = new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g')
    let lines = str.replace(rexp, '$1\n').split('\n')
    // Limit to maximum maxLines, add ellipsis if more
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines)
        lines[maxLines - 1] = lines[maxLines - 1].substr(0, w - 3) + '...'
    }
    return lines.join('\n')
}

module.exports = {
    parseOptions,
    wrap
}
