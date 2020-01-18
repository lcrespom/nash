const hl = require('../src/plugins/syntax-highlight')


//------------------------- Highlight -------------------------

test('Single command', () => {
    let hls = hl.highlight('ls')
    expect(hls.length).toBe(1)
    expect(hls[0].type).toBe(hl.NodeType.command)
})

test('Command and file', () => {
    let hls = hl.highlight('ls nash.js')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.parameter)
})

test('Command and env', () => {
    let hls = hl.highlight('echo $TERM')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.builtin)
    expect(hls[1].type).toBe(hl.NodeType.environment)
})

test('Command and option', () => {
    let hls = hl.highlight('ls -lah')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.option)
})

test('Command and quote', () => {
    let hls = hl.highlight('echo "some text"')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.builtin)
    expect(hls[1].type).toBe(hl.NodeType.quote)
})

test('Simple command with everything', () => {
    let hls = hl.highlight('echo -n $TERM potato "hello, world!"')
    expect(hls.length).toBe(5)
    expect(hls[0].type).toBe(hl.NodeType.builtin)
    expect(hls[1].type).toBe(hl.NodeType.option)
    expect(hls[2].type).toBe(hl.NodeType.environment)
    expect(hls[3].type).toBe(hl.NodeType.parameter)
    expect(hls[4].type).toBe(hl.NodeType.quote)
})

test('Pipe', () => {
    let hls = hl.highlight('echo hello | wc')
    expect(hls.length).toBe(3)
    expect(hls[0].type).toBe(hl.NodeType.builtin)
    expect(hls[1].type).toBe(hl.NodeType.parameter)
    expect(hls[2].type).toBe(hl.NodeType.command)
})

test('Comment', () => {
    let hls = hl.highlight('ls  # comment')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.comment)
})

test('Which', () => {
    let hls = hl.highlight('mkdir')
    expect(hls[0].type).toBe(hl.NodeType.program)
    hls = hl.highlight('a_program_that_does_not_exist')
    expect(hls[0].type).toBe(hl.NodeType.commandError)

})


//------------------------- Colorize -------------------------

function nodeTypeName(type) {
    for (let k of Object.keys(hl.NodeType)) {
        if (hl.NodeType[k] == type)
            return k
    }
    return '?'
}
function colorFunc(chunk, hlItem) {
    return `(${nodeTypeName(hlItem.type)}/${chunk})`
}

function colorize(line) {
    let hls = hl.highlight(line)
    return hl.colorize(line, hls, colorFunc)
}

test('Colorize single command', () => {
    let result = colorize('ls')
    expect(result).toBe('(command/ls)')
})