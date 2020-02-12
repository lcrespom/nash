function itemWithDesc(item, desc) {
    let result = new String(item)
    result.desc = desc
    return result
}

function parseOptions(cmd) {
    // return [
    //     itemWithDesc('--option-one', 'Description for option one'),
    //     itemWithDesc('-o, --option-two', 'Line one of description for option two\n... and line two')
    // ]
    return []
}

module.exports = {
    parseOptions
}
