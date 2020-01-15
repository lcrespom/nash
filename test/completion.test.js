const completion = require('../src/plugins/completion')

test('Simple params', () => {
    let line = {
        left: 'echo abc',
        right: 'de'
    }
    let [word, type] = completion.getWordAndType(line)
    expect(type).toBe('parameter')
    expect(word).toBe('abc')
    // line = {
    //     left: 'echo abc def',
    //     right: ''
    // }
    // [word, type] = completion.getWordAndType(line)
    // expect(type).toBe('parameter')
    // expect(word).toBe('def')
})