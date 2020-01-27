const { registerLineDecorator } = require('../editor')
const { bindKey } = require('../key-bindings')
const history = require('../history')
const { getOption, setDefaultOptions } = require('../startup')
const { colorize } = require('../colors')


let lastSuggestion = ''

function getSuggestion(line) {
    if (line.length == 0) return ''
    let h = history.back(line, { updateIndex: false })
    if (!h) return ''
    return h.substr(line.length)
}

function acceptSuggestion(line, key) {
    // If 'rigth' key pressed accept only at end of line
    if (key.name == 'right' && line.right) return line
    // If no suggestion available, do nothing
    if (lastSuggestion == '') return line
    // Apply suggestion
    return {
        left: line.left + line.right + lastSuggestion,
        right: ''
    }
}


let colors

function start() {
    bindKey(['ctrl-space', 'right'], acceptSuggestion,
    'Accept line suggestion')

    registerLineDecorator((plainLine, decoratedLine, line) => {
        if (line && line.decorateHint == 'no suggestions')
            return decoratedLine
        lastSuggestion = getSuggestion(plainLine)
        return decoratedLine + colorize(colors.scol, lastSuggestion)
    })

    setDefaultOptions('colors.suggestion', { scol: '#606060'})
    colors = getOption('colors.suggestion')
}


module.exports = { start }
