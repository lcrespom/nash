const parser = require('../src/parser');

test('Single command', () => {
	expect(parser.parse('ls').command).toBe('ls');
})

test('Single command with blanks', () => {
	expect(parser.parse('  ls').command).toBe('ls');
	expect(parser.parse('ls   ').command).toBe('ls');
	expect(parser.parse(' \t ls \t').command).toBe('ls');
})

test('Command and unquoted params', () => {
	let parsed = parser.parse('ls -la')
	expect(parsed.command).toBe('ls')
	expect(parsed.params.length).toBe(1)
	let p0 = parsed.params[0]
	expect(p0.type).toBe(parser.ParamType.unquoted)
	expect(p0.text).toBe('-la')
})