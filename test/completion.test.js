const {
    NodeType, getWordAndType, getCompletions
} = require('../src/plugins/completion')


//------------------------- getWordAndType -------------------------

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

test('Right after command', () => {
    let line = { left: 'git ', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.parameter)
    expect(word).toBe('')
})

test('Right after command', () => {
    let line = { left: 'git co', right: '' }
    let [word, type] = getWordAndType(line)
    expect(type).toBe(NodeType.parameter)
    expect(word).toBe('co')
})


//------------------------- getCompletions -------------------------

async function getWords(left) {
    let line = { left, right: '' }
    let [word, type] = getWordAndType(line)
    if (type == NodeType.unknown && line.left.endsWith('$'))
        [word, type] = ['$', NodeType.environment]
    return await getCompletions(word, type, line)
}

test('cd /', async done => {
    let words = await getWords('cd /')
    //TODO why does glob fail here?
    expect(words).toContain(['/usr'])
    done()
})

test('ls', async done => {
    let words = await getWords('ls ')
    expect(words).toContain('../')
    expect(words).toContain('package.json')
    expect(words).toContain('src/')
    done()
})

test('cd', async done => {
    let words = await getWords('cd ')
    expect(words).toContain('../')
    expect(words).toContain('src/')
    expect(words).not.toContain('package.json')
    done()
})

test('cd src/', async done => {
    let words = await getWords('cd src/')
    expect(words).toEqual(['src/../', 'src/plugins/'])
    done()
})

test('cd src/plugins/comp', async done => {
    let words = await getWords('cd src/plugins/comp')
    expect(words).toEqual(['src/plugins/completion/'])
    done()
})

