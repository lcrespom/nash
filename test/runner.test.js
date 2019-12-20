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