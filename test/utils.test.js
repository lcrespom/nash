const chalk = require('chalk')
const { getProp, setProp } = require('../src/utils')
const { removeAnsiColorCodes, substrWithColors } = require('../src/terminal')

//------------------------- substrWithColors -------------------------

test('Cut no colors', () => {
    let s = substrWithColors('abcdefghijkl', 4, 2)
    expect(s).toBe('ef')
    s = substrWithColors('abcdefghijkl', 4, 50)
    expect(s).toBe('efghijkl')
    s = substrWithColors('abcdefghijkl', 50, 50)
    expect(s).toBe('')
    s = substrWithColors('abcdefghijkl', 4, 0)
    expect(s).toBe('')
})

test('Cut with colors', () => {
    let sc = chalk.white('abc') + chalk.green('def')
        + chalk.red.underline('ghi') + chalk.hex('#defeca')('jkl')
    let s = substrWithColors(sc, 4, 2)
    let exp = '\x1b[37m\x1b[39m' + chalk.green('ef')
    expect(s.startsWith(exp)).toBe(true)
    s = substrWithColors(sc, 4, 7)
    exp = '\x1b[37m\x1b[39m' + chalk.green('ef') +
        chalk.red.underline('ghi') + chalk.hex('#defeca')('jk')
    expect(s).toBe(exp)
    s = substrWithColors(sc, 4, 50)
    exp = '\x1b[37m\x1b[39m' + chalk.green('ef') +
        chalk.red.underline('ghi') + chalk.hex('#defeca')('jkl')
    expect(s).toBe(exp)
    s = substrWithColors(sc, 50, 50)
    expect(removeAnsiColorCodes(s)).toBe('')
    s = substrWithColors(sc, 4, 0)
    expect(s).toBe('')
})


//------------------------- Get/set property -------------------------

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
