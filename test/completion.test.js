const completion = require('../src/plugins/completion')

test('Simple param', () => {
    let line = { left: 'echo abc', right: 'de' }
    let [word, type] = completion.getWordAndType(line)
    expect(type).toBe('parameter')
    expect(word).toBe('abc')
})

test('Simple params', () => {
    let line = { left: 'echo abc def', right: '' }
    let [word, type] = completion.getWordAndType(line)
    expect(type).toBe('parameter')
    expect(word).toBe('def')
})

test('Simple command', () => {
    let line = { left: 'some', right: 'command' }
    let [word, type] = completion.getWordAndType(line)
    expect(type).toBe('command')
    expect(word).toBe('some')
})

test('Pipe', () => {
    let line = { left: 'cat|wc', right: '' }
    let [word, type] = completion.getWordAndType(line)
    expect(type).toBe('command')
    expect(word).toBe('wc')
})
