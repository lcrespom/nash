const parser = require('../src/parser');

function checkArg(arg, type, text) {
	expect(arg.type).toBe(type)
	expect(arg.text).toBe(text)
}

test('Single command', () => {
	checkArg(parser.parseLine('ls')[0],
		parser.ParamType.text, 'ls')
})

test('Single command with blanks', () => {
	checkArg(parser.parseLine('  ls')[0],
		parser.ParamType.text, 'ls')
	checkArg(parser.parseLine('ls   ')[0],
		parser.ParamType.text, 'ls')
	checkArg(parser.parseLine(' \t ls \t')[0],
		parser.ParamType.text, 'ls')
})

test('Command and unquoted params', () => {
	let args = parser.parseLine('ls -la *.txt')
	expect(args[0].text).toBe('ls')
	expect(args.length).toBe(3)
	expect(args[1].type).toBe(parser.ParamType.text)
	expect(args[1].text).toBe('-la')
	expect(args[2].type).toBe(parser.ParamType.text)
	expect(args[2].text).toBe('*.txt')
})

test('Command and quotes', () => {
	let cmd = `echo  "Hello, world!" 'single quoted'`
	let args = parser.parseLine(cmd)
	expect(args[0].text).toBe('echo')
	expect(args.length).toBe(3)
	expect(args[1].type).toBe(parser.ParamType.text)
	expect(args[1].text).toBe('Hello, world!')
	expect(args[1].quote).toBe('"')
	expect(args[2].type).toBe(parser.ParamType.text)
	expect(args[2].text).toBe('single quoted')
	expect(args[2].quote).toBe("'")
})

test('Env', () => {
	let args = parser.parseLine('echo $PATH')
	checkArg(args[1], parser.ParamType.env, '$PATH')
})
