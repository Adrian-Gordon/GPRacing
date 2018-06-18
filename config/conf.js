'use strict'

const nconf = require('nconf')
nconf.env().argv()

// if 'conf' environment variable or command line argument is provided, load
// the configuration JSON file provided as the value
let path = nconf.get('conf')
if (path) {
  // logger.info("use file: " + path);
  nconf.file({file: path})
}

nconf.defaults(
  {
    'logging': {
      'fileandline': true,
      'logger': {
        'console': {
          'level': 'info',
          'colorize': true,
          'label': 'gpracing',
          'timestamp': true
        }
      }

    },
    'absoluteMinimumSpeed': 12.0,
    'absoluteMaximumSpeed': 20.0,
    'goingmappings': {"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3,"Very Soft":3}

    

  })

module.exports = Object.assign({}, {nconf})
