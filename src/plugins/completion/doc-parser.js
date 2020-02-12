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

function itemWithDesc(item, desc) {
    let result = new String(item)
    result.desc = desc
    return result
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

function parseMan(lines) {
    if (!lines || lines.length == 0) return []
    let opts = []
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
            opts.push(line)
        }
    }
    return opts
}

async function parseOptions(cmd) {
    // return [
    //     itemWithDesc('--option-one', 'Description for option one'),
    //     itemWithDesc('-o, --option-two', 'Line one of description for option two\n... and line two')
    // ]
    let out = await getManOut(cmd)
    return parseMan(out)
}

module.exports = {
    parseOptions
}
