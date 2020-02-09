const { bindKey, getKeyBindingByFunction } = require(NASH_BASE + '/key-bindings')
const { runCommand } = require(NASH_BASE + '/runner')
const env = require(NASH_BASE + '/env')
const { dirHistory } = require(NASH_BASE + '/history')


function deleteWordToLeft(line) {
    return {
        left: line.left.replace(/\w+[^\w]*$/, ''),
        right: line.right
    }
}

async function cdParent(line) {
    if (env.cwd() == '/')
        return { ...line, showPrompt: false }
    await runCommand('cd ..')
    return { left: line.left, right: line.right }
}

async function cdBack(line) {
    let dir = dirHistory.back()
    if (dir == env.cwd())
        dir = dirHistory.back()
    if (dir)
        await runCommand('cd ' +  dir, { pushDir: false })
    return { left: line.left, right: line.right }
}


function start() {
    // Register 'alt-backspace' key handler
    bindKey('meta-backspace', deleteWordToLeft,
        'Deletes the word before the cursor')

    // Register 'shift-up' key handler
    bindKey('shift-up', cdParent, 'Changes to the parent directory')
    // Register 'shift-down' key handler
    bindKey('shift-down', cdBack, 'Moves one directory back in history')

    // Get the key handler identified by 'listKeys' and re-assign it to 'alt-h'
    let help = getKeyBindingByFunction('listKeys')
    if (help)
        bindKey('meta-h', help.code, help.desc)
}


module.exports = { start }
