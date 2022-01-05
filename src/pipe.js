const net = require('net')
const path = require('path')

let prefix = process.platform == 'win32' ? '\\\\?\\pipe' : ''
let pname = path.join(prefix, process.cwd(), 'jash-')

/**
 * @param {(msg: string) => void} cb
 */
function startPipeServer(cb) {
    pname += process.pid
    let svr = net.createServer()
    svr.listen(pname)
    svr.on('connection', socket => {
        socket.on('data', buf => {
            let msg = buf.toString()
            cb(msg)
        })
        socket.on('close', _ => {})
    })
}

/**
 * @param {number} pid
 * @param {string} msg
 */
function pipeClient(pid, msg) {
    let socket = net.createConnection(pname + pid)
    socket.write(msg)
    socket.end()
}

module.exports = {
    startPipeServer,
    pipeClient
}
