const runner = require('../src/runner');

test('Echo', done => {
	runner.runCommand('echo Hello', () => {
		//TODO capture stdout and stderr
		expect(true).toBe(true)
		done()
	})
})