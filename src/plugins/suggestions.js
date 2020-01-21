const chalk = require('chalk')

const { registerLineDecorator } = require('../editor')
const { bindKey } = require('../key-bindings')
const history = require('../history')

let lastSuggestion = ''

function getSuggestion(line) {
    if (line.length == 0) return ''
    let h = history.back(line, { updateIndex: false })
    if (!h) return ''
    return h.substr(line.length)
}

function acceptSuggestion(line) {
    if (lastSuggestion == '') return line
    return {
        left: line.left + line.right + lastSuggestion,
        right: ''
    }
}

function colorize(str) {
    if (str == '') return str
    return chalk.hex('#606060')(str)
}


bindKey('shift-right', acceptSuggestion, 'Accept line suggestion')

registerLineDecorator((plainLine, decoratedLine, line) => {
    if (line && line.decorateHint == 'no suggestions')
        return decoratedLine
    lastSuggestion = getSuggestion(plainLine)
    return decoratedLine + colorize(lastSuggestion)
})
