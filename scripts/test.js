const path = require('path');
const Jasmine = require('jasmine');
const { SpecReporter } = require('jasmine-spec-reporter');

const noop = () => {};
const jrunner = new Jasmine();

jrunner.configureDefaultReporter({ print: noop });
jasmine.getEnv().addReporter(new SpecReporter({
	displayStacktrace: 'summary',
	displayFailuresSummary: true,
	displaySuccessfulSpec: true,
	displayFailedSpec: true,
	displayPendingSpec: true,
	displaySpecDuration: true,
	displaySuiteNumber: false,
	colors: {
		success: 'green',
		failure: 'red',
		skipped: 'cyan',
	},
	prefixes: {
		success: '✓ ',
		failure: '✗ ',
		pending: '- ',
	},
	customProcessors: [],
}));

jrunner.projectBaseDir = '';
jrunner.specDir = '';
jrunner.addSpecFiles([
	path.resolve('tests/*Spec.js'),
]);
jrunner.execute();
