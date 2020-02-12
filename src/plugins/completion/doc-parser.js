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

async function getManPath() {
    let mp = await runCommand('manpath')
    if (!mp[0])
        return ['/usr/share/man']
    return mp[0].split(':')
}

async function getManSource(cmd) {
    if (!manpath)
        manpath = await getManPath()
    for (let p of manpath) {
        let fname = `${p}/man1/${cmd}.1`
        let src = await runCommand(`cat ${fname} || gzip -cd ${fname}.gz`)
        if (src.length > 0)
            return src
    }
    return null
}

function parseManSource(src) {
    // See https://linux.die.net/man/7/man
    let doc = { sections: {} }
    let section = null
    let paragraph = null
    for (let line of src) {
        if (line.startsWith('.')) {
            let command = line.split(' ')[0]
            let param = line.substr(command.length + 1)
            switch (command) {
                case '.TH':
                    doc.title = param
                    break
                case '.SH':
                    section = param
                    if (section.match(/^".+"$/))
                        section = section.substr(1, -1)
                    doc.sections[section] = []
                    paragraph = ''
                    break
                case '.LP': case '.P': case '.PP':
                    if (!section || !paragraph) break
                    doc.sections[section].push(paragraph)
            }
        }
    }
}


async function parseOptions(cmd) {
    // return [
    //     itemWithDesc('--option-one', 'Description for option one'),
    //     itemWithDesc('-o, --option-two', 'Line one of description for option two\n... and line two')
    // ]
    let source = await getManSource(cmd.replace(/ /g, '-'))
    if (!source) return []
    let man = parseManSource(source)
    //console.log(source)
    return []
}

module.exports = {
    parseOptions
}
