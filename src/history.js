const os = require('os')
const fs = require('fs')


const doNothing = () => {}


class History {

    constructor(filename, maxSize = 1000) {
        this.history = []
        this.index = 0
        this.maxSize = maxSize
        this.historyPath = os.homedir() + '/.nash/' + filename
        this.fd = null
    }

    clear() {
        this.history = []
        this.index = this.history.length
    }

    push(cmd) {
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

    matchBackwards(text) {
        let idx = this.index
        let result = []
        while (idx > 0) {
            idx--
            if (this.history[idx].startsWith(text))
                result.push(this.history[idx])
        }
        return result
    }

    toEnd() {
        this.index = this.history.length
    }

    all() {
        return this.history
    }

    peek() {
        return this.history[this.length - 1]
    }

    _openForAppend() {
        fs.open(this.historyPath, 'a', (err, fd) => {
            if (err) return
            this.fd = fd
        })
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
            this._openForAppend()
        })
    }
    
    close() {
        if (this.fd)
            fs.close(this.fd, doNothing)
    }
}


module.exports = {
    history: new History('history'),
    dirHistory: new History('dirhistory')
}
