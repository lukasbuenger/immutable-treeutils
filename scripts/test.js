var path = require('path')
var Jasmine = require('jasmine')
var SpecReporter = require('jasmine-spec-reporter')
  .SpecReporter

var noop = function() {}
var jrunner = new Jasmine()

jrunner.configureDefaultReporter({
  print: noop
})
jasmine.getEnv().addReporter(
  new SpecReporter({
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
      skipped: 'cyan'
    },
    prefixes: {
      success: '✓ ',
      failure: '✗ ',
      pending: '- '
    },
    customProcessors: []
  })
)

jrunner.projectBaseDir = ''
jrunner.specDir = ''
jrunner.addSpecFiles([
  path.resolve('tests.js')
])
jrunner.execute()
