let { getProp, setProp } = require('../src/utils')

test('Get OK', () => {
    let obj = { a: { b: 1, c: 2 }}
    expect(getProp(obj, 'a.b')).toBe(obj.a.b)
    expect(getProp(obj, 'a')).toBe(obj.a)
})

test('Get undefined', () => {
    let obj = { a: { b: 1, c: 2 }}
    expect(getProp(obj, 'a.z')).toBe(undefined)
    expect(getProp(obj, 'z')).toBe(undefined)
    expect(getProp(obj, '')).toBe(undefined)
})

test('Set update', () => {
    let obj = { a: { b: 1, c: 2 }}
    setProp(obj, 'a.b', 'hello')
    expect(obj.a.b).toBe('hello')
})

test('Set add leaf', () => {
    let obj = { a: { b: 1, c: 2 }}
    setProp(obj, 'a.z', 'hello')
    expect(obj.a.z).toBe('hello')
})

test('Set add nested', () => {
    let obj = { a: { b: 1, c: 2 }}
    setProp(obj, 'x', 'hello')
    expect(obj.x).toBe('hello')
})

test('Set add deep nested', () => {
    let obj = { a: { b: 1, c: 2 }}
    setProp(obj, 'x.y.z.t', 'hello')
    expect(obj.x.y.z.t).toBe('hello')
})
