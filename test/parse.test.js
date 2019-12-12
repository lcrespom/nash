const parser = require('../src/parser');

test('Single command', () => {
	let pc = parser.parse('ls')
	expect(pc.command).toBe('ls');
});
