const os = require('os')
const fs = require('fs')


class History {

    constructor(filename) {
        this.history = []
        this.index = 0
        this.maxSize = 1000
        this.historyPath = os.homedir() + '/.nash/' + filename
    }

    clear() {
        this.history = []
        this.index = this.history.length
    }
    
    push(cmd) {
        this.history.push(cmd)
        if (this.history.length > this.maxSize) this.history.splice(0, 1)
        this.index = this.history.length
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
    
    load() {
        if (!fs.existsSync(this.historyPath)) return
        fs.readFile(this.historyPath, (err, data) => {
            if (err) return
            this.history = data.toString().split('\n')
            this.index = this.history.length
        })
    }
    
    save() {
        fs.writeFile(this.historyPath, this.history.join('\n'), () => {})
    }
}


module.exports = {
    history: new History('history')
}
