let history = []
let index = 1
let maxSize = 1000

function push(cmd) {
    history.push(cmd)
    if (history.length > maxSize) history.splice(0, 1)
    index = history.length
}

function back() {
    if (index == 0) return null
    index--
    return history[index]
}

function forward() {
    if (index == history.length - 1) return null
    index++
    return history[index]
}

function all() {
    return history
}

function load() {
    //TODO load from file
}

function save() {
    //TODO save to file
}


module.exports = {
    push,
    back,
    forward,
    all,
    load,
    save
}
