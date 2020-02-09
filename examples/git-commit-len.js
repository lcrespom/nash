const { registerLineDecorator } = require(NASH_BASE + '/editor')
const { colorize } = require(NASH_BASE + '/colors')

const MAX_MSG_LEN = 50

function gitWarn(plainLine, decoratedLine) {
    // Search for 'git commit "commit message" ...'
    let patt = /^\s*git\s+commit[^"]+("[^"]+)"?/
    let m = plainLine.match(patt)
    if (!m) return decoratedLine
    // Match found, check if message is too long
    if (m[1].length <= MAX_MSG_LEN) return decoratedLine
    // Message is longer than limit
    return decoratedLine.replace(m[1], (m1) => {
        let oktxt = m1.substr(0, MAX_MSG_LEN)
        // Add some warning background on the overflow text
        let warntxt = colorize('inverse', m1.substr(MAX_MSG_LEN))
        return `${oktxt}${warntxt}`
    })
}

function start() {
    registerLineDecorator(gitWarn)
}


module.exports = { start }
