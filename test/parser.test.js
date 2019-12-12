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
	expect(args.length).toBe(3)
	expect(args[0].text).toBe('ls')
	expect(args[1].type).toBe(parser.ParamType.text)
	expect(args[1].text).toBe('-la')
	expect(args[2].type).toBe(parser.ParamType.text)
	expect(args[2].text).toBe('*.txt')
})

test('Command and quotes', () => {
	let cmd = `echo  "Hello, world!" 'single quoted'`
	let args = parser.parseLine(cmd)
	expect(args.length).toBe(3)
	expect(args[0].text).toBe('echo')
	expect(args[1].type).toBe(parser.ParamType.text)
	expect(args[1].text).toBe('Hello, world!')
	expect(args[1].quote).toBe('"')
	expect(args[2].type).toBe(parser.ParamType.text)
	expect(args[2].text).toBe('single quoted')
	expect(args[2].quote).toBe("'")
})

test('Weird quoted and unquoted together', () => {
	let args = parser.parseLine('echo "Hello"world')
	expect(args.length).toBe(3)
	expect(args[1].quote).toBe('"')
	expect(args[1].text).toBe('Hello')
	expect(args[2].quote).not.toBe('"')
	expect(args[2].text).toBe('world')
})

test('Env', () => {
	let args = parser.parseLine('echo $PATH')
	checkArg(args[1], parser.ParamType.env, '$PATH')
})

test('JavaScript', () => {
	let args = parser.parseLine('echo $( "Hello from JS" $) foo')
	expect(args.length).toBe(3)
	expect(args[1].type).toBe(parser.ParamType.javascript)
	expect(args[1].text).toBe(' "Hello from JS" ')
	expect(args[2].type).toBe(parser.ParamType.text)
	expect(args[2].text).toBe('foo')
})