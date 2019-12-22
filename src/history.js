let history = []
let index = 1
let maxSize = 1000


function clear() {
    history = []
}

function push(cmd) {
    history.push(cmd)
    if (history.length > maxSize) history.splice(0, 1)
    index = history.length
}

function back(text = '') {
    while (index > 0) {
        index--
        if (history[index].startsWith(text))
            return history[index]
    }
    return null
}

function forward(text = '') {
    while (index < history.length - 1) {
        index++
        if (history[index].startsWith(text))
            return history[index]
    }
    return null
}

function toEnd() {
    index = history.length
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
    clear,
    push,
    back,
    forward,
    toEnd,
    all,
    load,
    save
}
