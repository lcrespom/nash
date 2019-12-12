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
	let parsed = parser.parse('ls -la *.txt')
	expect(parsed.command).toBe('ls')
	expect(parsed.params.length).toBe(2)
	let p0 = parsed.params[0]
	expect(p0.type).toBe(parser.ParamType.unquoted)
	expect(p0.text).toBe('-la')
	let p1 = parsed.params[1]
	expect(p1.type).toBe(parser.ParamType.unquoted)
	expect(p1.text).toBe('*.txt')
})

test('Command and quotes', () => {
	let cmd = `echo  "Hello, world!" 'single quoted'`
	let parsed = parser.parse(cmd)
	expect(parsed.command).toBe('echo')
	expect(parsed.params.length).toBe(2)
	let p0 = parsed.params[0]
	expect(p0.type).toBe(parser.ParamType.dquoted)
	expect(p0.text).toBe('Hello, world!')
	let p1 = parsed.params[1]
	expect(p1.type).toBe(parser.ParamType.squoted)
	expect(p1.text).toBe('single quoted')
})