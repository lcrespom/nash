const os = require('os')
const fs = require('fs')


const doNothing = () => {}


class History {

    constructor(filename, maxSize) {
        this.init(filename, maxSize)
    }

    init(filename, maxSize = 1000) {
        this.history = []
        this.index = 0
        this.maxSize = maxSize
        this.historyPath = os.homedir() + '/.nash/history/' + filename
        this.fd = null
    }

    clear() {
        this.history = []
        this.index = this.history.length
    }

    push(cmd) {
        if (this.peek() == cmd) return  // Skip duplicates
        this.history.push(cmd)
        if (this.history.length > this.maxSize)
            this.history.splice(0, 1)
        this.index = this.history.length
        if (this.fd)
            fs.appendFile(this.fd, cmd + '\n', doNothing)
    }

    back(text = '', { updateIndex = true } = {}) {
        let idx = this.index
        let result = null
        while (idx > 0) {
            idx--
            if (this.history[idx].startsWith(text)) {
                result = this.history[idx]
                break
            }
        }
        if (updateIndex)
            this.index = idx
        return result
    }

    forward(text = '') {
        while (this.index < this.history.length - 1) {
            this.index++
            if (this.history[this.index].startsWith(text))
                return this.history[this.index]
        }
        return null
    }

    matchBackwards(text, matcher) {
        let startsWith = (i, t) => i.startsWith(t)
        matcher = matcher || startsWith
        let idx = this.index
        let result = []
        while (idx > 0) {
            idx--
            if (matcher(this.history[idx], text))
                result.push(this.history[idx])
        }
        return result
    }

    matchLines(text, matcher) {
        let startsWith = (i, t) => i.startsWith(t)
        matcher = matcher || startsWith
        let result = []
        for (let line of this.history)
            if (matcher(line, text))
                result.push(line)
        return result
    }

    toEnd() {
        this.index = this.history.length
    }

    all() {
        return this.history
    }

    peek() {
        return this.history[this.history.length - 1]
    }

    _openForAppend() {
        fs.open(this.historyPath, 'a', (err, fd) => {
            if (err) return
            this.fd = fd
        })
    }

    _removePastDuplicates(cb) {
        let lines = [...new Set(this.history.slice().reverse())].reverse()
        fs.writeFile(this.historyPath, lines.join('\n') + '\n', cb)
    }

    load() {
        if (!fs.existsSync(this.historyPath)) {
            this._openForAppend()
            return
        }
        fs.readFile(this.historyPath, (err, data) => {
            if (err) return
            this.history = data.toString().trim().split('\n')
            if (this.history.length > this.maxSize)
                this.history = this.history.slice(-this.maxSize)
            this.index = this.history.length
            this._removePastDuplicates(_ => this._openForAppend())
        })
    }
    
    close() {
        if (this.fd)
            fs.close(this.fd, doNothing)
    }
}


let history
let dirHistory

function initHistory(hist, hostname, ext) {
    if (hist) {
        hist.close()
        hist.init(hostname + ext)
    }
    else {
        hist = new History(hostname + ext)
    }
    hist.load()
    return hist
}

function initialize(hostname) {
    history = initHistory(history, hostname, '.history')
    dirHistory = initHistory(dirHistory, hostname, '.dirHistory')
}

initialize(os.hostname())


module.exports = {
    history,
    dirHistory,
    initialize
}
