const { NodeType, getWordAndType } = require('../src/plugins/completion')

test('Simple param', () => {
    let line = { left: 'echo abc', right: 'de' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.parameter)
    expect(word).toBe('abc')
})

test('Simple params', () => {
    let line = { left: 'echo abc def', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.parameter)
    expect(word).toBe('def')
})

test('At end of param', () => {
    let line = { left: 'echo abc', right: ' def' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.parameter)
    expect(word).toBe('abc')
})

test('Simple command', () => {
    let line = { left: 'some', right: 'command' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.command)
    expect(word).toBe('some')
})

test('Pipe', () => {
    let line = { left: 'cat|wc', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.command)
    expect(word).toBe('wc')
})

test('And', () => {
    let line = { left: 'aaa && bbb', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.command)
    expect(word).toBe('bbb')
})

test('Between commands', () => {
    let line = { left: 'aaa ', right: 'bbb' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.unknown)
    expect(word).toBe('')
})

test('Environment', () => {
    let line = { left: 'echo $TERM', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.environment)
    expect(word).toBe('$TERM')
})

test('Option', () => {
    let line = { left: 'ls -lah', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.option)
    expect(word).toBe('-lah')
})
