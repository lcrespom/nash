const chalkModule = require('chalk')

const { ucfirst } = require('./utils')
const { getOption } = require('./startup')


let chalk = null

function getChalk() {
    if (chalk) return chalk
    let trueColor = getOption('colors.trueColor')
    if (trueColor)
        chalk = new chalkModule.Instance({ level: 3 })
    else
        chalk = chalkModule
    return chalk
}

function colorize(cname, str) {
    let chalk = getChalk()
    if (str == '') return str
    let colors = cname.trim().split(' ')
    let colorfunc = chalk
    for (let color of colors) {
        if (color.startsWith('/')) {
            color = color.substr(1)
            if (color.startsWith('#'))
                colorfunc = colorfunc.bgHex(color)
            else
                colorfunc = colorfunc['bg' + ucfirst(color)]
        }
        else {
            if (color.startsWith('#'))
                colorfunc = colorfunc.hex(color)
            else
                colorfunc = colorfunc[color]
        }
    }
    return colorfunc(str)
}


module.exports = {
    colorize
}
