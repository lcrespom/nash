//const { runHiddenCommand } = require('../../runner')

let manpath = null


function commandOut2Array(out) {
	let arr = out.trim().split('\n')
	let rc = arr.pop()
	return rc === '0' ? arr : []
}

//TODO replace with runHiddenCommand after testing
const { exec } = require('child_process')
function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, out, stderr) => {
            if (err) resolve([])
            resolve(out.toString().trim().split('\n'))
        })
    })
}

// function runCommand(cmd) {
//     let out = await runHiddenCommand(`${cmd} | cat; echo $?`)
//     return commandOut2Array(out)
// }

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

function parseMan(lines) {
    const cleanOpt = o => ({ name: o.name, desc: o.desc.trim() })
    if (!lines || lines.length == 0) return []
    let opts = []
    let opt = null
    let inOptions = false
    for (let line of lines) {
        line = removeBackChars(line)
        if (!inOptions) {
            if (line == 'OPTIONS') {
                inOptions = true
                continue
            }
        }
        else {
            if (line.length > 0 && line[0] != ' ') break
            line = line.trim()
            if (line.startsWith('-')) {
                if (opt) opts.push(cleanOpt(opt))
                opt = { name: line, desc: '' }
            }
            else if (opt) {
                if (line.length == 0) {
                    opt.done = true
                }
                else if (!opt.done) opt.desc += '\n' + line
            }
        }
    }
    if (opt) opts.push(cleanOpt(opt))
    return opts
}

function itemWithDesc(item, desc) {
    let result = new String(item)
    result.desc = desc
    return result
}

async function parseOptions(cmd) {
    let out = await getManOut(cmd)
    return parseMan(out).map(opt => itemWithDesc(opt.name, opt.desc))
}

function wrap(str, w, maxLines) {
    if (!str) return str
    str = str.split('\n').join(' ')
    let rexp = new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g')
    let lines = str.replace(rexp, '$1\n').split('\n')
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines)
        lines[maxLines - 1] = lines[maxLines - 1].substr(0, w) + '...'
    }
    return lines.join('\n')
}

module.exports = {
    parseOptions,
    wrap
}
