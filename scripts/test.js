var exec = require('child_process').exec
var path = require('path')
var Jasmine = require('jasmine')
var SpecReporter = require('jasmine-spec-reporter')
  .SpecReporter

var version =
  process.env.IMMUTABLE_VERSION ||
  'latest'
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

jrunner.onComplete(function(passed) {
  console.log(
    'Tests'.concat(
      passed ? ' passed' : ' failed',
      ' on immutable@',
      version,
      '.'
    )
  )
})

exec(
  'npm install immutable@'.concat(
    version,
    ' --save false'
  ),
  { cwd: './' },
  function(error) {
    if (error) {
      console.log(error)
    } else {
      console.log(
        'Test with immutable@'.concat(
          version,
          ' ...'
        )
      )
      jrunner.execute()
    }
  }
)
