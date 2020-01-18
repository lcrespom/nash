const chalk = require('chalk')

const { registerLineDecorator } = require('../editor')
const history = require('../history')

function getSuggestion(line) {
    if (line.length == 0) return ''
    let h = history.back(line, { updateIndex: false })
    if (!h) return ''
    return chalk.hex('#666')(h.substr(line.length))
}

registerLineDecorator((plainLine, pdl) => {
    return pdl + getSuggestion(plainLine)
})