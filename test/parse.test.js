const parser = require('../src/parser');

test('Single command', () => {
	expect(parser.parse('ls').command).toBe('ls');
})

test('Single command with blanks', () => {
	expect(parser.parse('  ls').command).toBe('ls');
	expect(parser.parse('ls   ').command).toBe('ls');
	expect(parser.parse(' \t ls \t').command).toBe('ls');
})
