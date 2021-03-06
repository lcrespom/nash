const { history } = require('../src/history')

test('Simple', () => {
	history.clear()
	history.push('one')
	history.push('two')
	history.push('three')
	expect(history.back('')).toBe('three')
	expect(history.back('')).toBe('two')
	expect(history.back('')).toBe('one')
	expect(history.back('')).toBeNull()
	expect(history.back('')).toBeNull()
	expect(history.forward('')).toBe('two')
	expect(history.forward('')).toBe('three')
	expect(history.forward('')).toBeNull()
})

test('With search text', () => {
	history.clear()
	history.push('potato one')
	history.push('tomato one')
	history.push('potato two')
	history.push('tomato two')
	history.push('potato three')
	history.push('tomato three')
	expect(history.back('onion')).toBeNull()
	history.toEnd()
	expect(history.back('pota')).toBe('potato three')
	expect(history.back('pota')).toBe('potato two')
	expect(history.back('pota')).toBe('potato one')
	expect(history.back('pota')).toBeNull()
	expect(history.back('pota')).toBeNull()
	expect(history.forward('pota')).toBe('potato two')
	expect(history.forward('pota')).toBe('potato three')
	expect(history.forward('pota')).toBeNull()
})
