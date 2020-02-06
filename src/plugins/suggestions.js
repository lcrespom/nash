const { registerLineDecorator } = require('../editor')
const { bindKey } = require('../key-bindings')
const { history } = require('../history')
const { getOption, setDefaultOptions } = require('../startup')
const { colorize } = require('../colors')


let suggestion = ''

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
    if (suggestion == '') return line
    // Apply suggestion
    return {
        left: line.left + line.right + suggestion,
        right: ''
    }
}


let colors

function start() {
    bindKey(['ctrl-space', 'right'], acceptSuggestion,
    'Accept line suggestion')

    registerLineDecorator((plainLine, decoratedLine, line) => {
        let lsLen = suggestion.length
        suggestion = getSuggestion(plainLine)
        return decoratedLine + colorize(colors.scol, suggestion.padEnd(lsLen))
    })

    setDefaultOptions('colors.suggestion', { scol: '#606060'})
    colors = getOption('colors.suggestion')
}


module.exports = { start }
