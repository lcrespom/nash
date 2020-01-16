const hl = require('../src/plugins/syntax-highlight')

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
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.environment)
})

test('Command and option', () => {
    let hls = hl.highlight('ls -lah')
    expect(hls.length).toBe(2)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.option)
})

test('Simple command with everything', () => {
    let hls = hl.highlight('echo -n $TERM "hello, world!"')
    expect(hls.length).toBe(4)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.option)
    expect(hls[2].type).toBe(hl.NodeType.environment)
    expect(hls[3].type).toBe(hl.NodeType.parameter)
})

test('Pipe', () => {
    let hls = hl.highlight('echo hello | wc')
    expect(hls.length).toBe(3)
    expect(hls[0].type).toBe(hl.NodeType.command)
    expect(hls[1].type).toBe(hl.NodeType.parameter)
    expect(hls[2].type).toBe(hl.NodeType.command)
})