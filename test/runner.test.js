const runner = require('../src/runner')

function nocrlf(str) {
	return str.replace(/\r\n/g, '\n')	// In case we are in Windows (ew!)
}

test('Echo', done => {
	runner.runCommand('echo Hello', out => {
		expect(nocrlf(out)).toBe('Hello\n')
		done()
	})
})

test('Pipe', done => {
	// With spaces
	runner.runCommand('echo hello world | wc', out => {
		expect(nocrlf(out)).toMatch(/^\s*1\s+2\s+12/)
		done()
	})
	// Without spaces
	runner.runCommand('echo hello world|wc', out => {
		expect(nocrlf(out)).toMatch(/^\s*1\s+2\s+12/)
		done()
	})
})

test('JavaScript', done => {
	runner.runCommand('echo $[ 2 + 2 $]', out => {
		expect(nocrlf(out)).toBe('4\n')
		done()
	})
})

test('JavaScript with context', done => {
	process.env.foo = 'bar'
	runner.runCommand('echo $[ this.foo $]', out => {
		expect(nocrlf(out)).toBe('bar\n')
		done()
	})
})