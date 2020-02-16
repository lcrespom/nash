const requireNash = m => require('../../' + m)
const { bindKey } = requireNash('key-bindings')
const { NodeType } = requireNash('parser')
const { getOption, setDefaultOptions } = requireNash('startup')
const { colorizer } = requireNash('colors')
const {
    getWordAndType, getCompletions, setCustomCommands
} = require('./completion-search')
const { replaceWordWithMatch, EditableMenu } = require('./menu')


function completeCD() {
    function noEmptyCD(l) {
        if (l.left + l.right == 'cd ')
            return { left: '', right: '', showPrompt: false }
        return l
    }
    let line = completeWord({ left: 'cd ', right: '' })
    if (line.promise) {
        line.promise = line.promise.then(l => noEmptyCD(l))
        return line
    }
    else {
        return noEmptyCD(line)
    }
}

async function completeWord(line, key) {
    if (line.left + line.right == '')
        return completeCD()
    let [word, type] = getWordAndType(line)
    if (type == NodeType.unknown && line.left.endsWith('$'))
        [word, type] = ['$', NodeType.environment]
    let words = await getCompletions(word, type, line, colors)
    let navigating = key && key.navigating
    if (words.length == 0 && !navigating) {
        // No match: do nothing
        return { ...line, showPrompt: false }
    }
    else if (words.length == 1 && !navigating) {
        // Exactly one match: update line
        let match = words[0].split('##')[0] // Remove description
        return {
            left: replaceWordWithMatch(line.left, word, match),
            right: line.right,
            showPrompt: false
        }
    }
    else {
        // Multiple matches: interactive navigation
        let menu = new EditableMenu(line, word, words, colors, menuColors)
        return menu.open()
    }
}


let colors
let menuColors

function setDefaults() {
    let sh = getOption('colors.syntaxHighlight')
    let defaultColors = {
        // Item colors based on file type
        file: sh.parameter,
		dir: sh.environment,
        link: sh.quote,
        executable: sh.program,
        option: sh.option,
        // General colors and backgrounds
		items: '/#272822',
		scrollArea: '/#272822',
        scrollBar: 'whiteBright',
        desc: sh.quote + ' /#223030',
        // File description (from ls -l) colors
        attrs: sh.commandError,
        user: sh.program,
        size: sh.quote,
        date: sh.option
    }
    setDefaultOptions('colors.completion', defaultColors)
    colors = getOption('colors.completion')
    menuColors = {
        item: colorizer(colors.items),
        scrollArea: colorizer(colors.scrollArea),
        scrollBar: colorizer(colors.scrollBar),
        desc: colorizer(colors.desc)
    }
}

function start() {
    setDefaults()
    bindKey('tab', completeWord, 'Complete word under cursor')
    setCustomCommands(getOption('completion.commands'))
}


module.exports = {
    getWordAndType,
    getCompletions,
    NodeType,
    start
}
