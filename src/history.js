const os = require('os')
const fs = require('fs')


let history = []
let index = 0
let maxSize = 1000


function clear() {
    history = []
    index = history.length
}

function push(cmd) {
    history.push(cmd)
    if (history.length > maxSize) history.splice(0, 1)
    index = history.length
}

function back(text = '', { updateIndex = true } = {}) {
    let idx = index
    let result = null
    while (idx > 0) {
        idx--
        if (history[idx].startsWith(text)) {
            result = history[idx]
            break
        }
    }
    if (updateIndex)
        index = idx
    return result
}

function forward(text = '') {
    while (index < history.length - 1) {
        index++
        if (history[index].startsWith(text))
            return history[index]
    }
    return null
}

function matchBackwards(text) {
    let idx = index
    let result = []
    while (idx > 0) {
        idx--
        if (history[idx].startsWith(text))
            result.push(history[idx])
    }
    return result
}

function toEnd() {
    index = history.length
}

function all() {
    return history
}


function getHistoryPath() {
    return os.homedir() + '/.nash/history'
}

function load() {
    let hpath = getHistoryPath()
    if (!fs.existsSync(hpath)) return
    fs.readFile(hpath, (err, data) => {
        if (err) return
        history = data.toString().split('\n')
        index = history.length
    })
}

function save() {
    fs.writeFile(getHistoryPath(), history.join('\n'), () => {})
}


module.exports = {
    clear,
    push,
    back,
    forward,
    matchBackwards,
    toEnd,
    all,
    load,
    save
}
