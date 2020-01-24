const chalk = require('chalk')

const { ucfirst } = require('./utils')


function colorize(cname, str) {
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
