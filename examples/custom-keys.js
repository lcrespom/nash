const requireNash = module.parent.require.bind(module.parent)

const { bindKey, getKeyBindingByFunction } = requireNash('./key-bindings')


function deleteWordToLeft(line) {
    return {
        left: line.left.replace(/\w+[^\w]*$/, ''),
        right: line.right
    }
}


function start() {
    // Register 'alt-backspace' key handler
    bindKey('meta-backspace', deleteWordToLeft,
        'Deletes the word before the cursor')

    // Get the key handler identified by 'listKeys' and re-assign it to 'alt-h'
    let help = getKeyBindingByFunction('listKeys')
    if (help)
        bindKey('meta-h', help.code, help.desc)
}


module.exports = { start }
