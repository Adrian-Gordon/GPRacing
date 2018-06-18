'use strict'

const nconf = require('../config/conf.js').nconf

// configure logging
var winston = require('winston')
var loggingConfig = nconf.get('logging')

var fileAndLine = loggingConfig.fileandline

Object.keys(loggingConfig).forEach(function (key) {
  if (key !== 'fileandline')winston.loggers.add(key, loggingConfig[key])
})

// logger is used globally

const logger = require('winston').loggers.get('logger')
logger.exitOnError = false

if (fileAndLine) {
  var loggerInfoOld = logger.info
  logger.info = function (msg) {
    var fandl = traceCaller(1)
    return (loggerInfoOld.call(this, fandl + ' ' + msg))
  }

  var loggerErrorOld = logger.error
  logger.error = function (msg) {
    var fandl = traceCaller(1)
    return (loggerErrorOld.call(this, fandl + ' ' + msg))
  }
}

function traceCaller (n) {
  if (isNaN(n) || n < 0) n = 1
  n += 1
  var s = (new Error()).stack
  var a = s.indexOf('\n', 5)
  while (n--) {
    a = s.indexOf('\n', a + 1)
    if (a < 0) { a = s.lastIndexOf('\n', s.length); break }
  }
  let b = s.indexOf('\n', a + 1); if (b < 0) b = s.length
  a = Math.max(s.lastIndexOf(' ', b), s.lastIndexOf('/', b))
  b = s.lastIndexOf(':', b)
  s = s.substring(a + 1, b)
  return s
}

// end logging config

module.exports = Object.assign({}, {logger})
