'use strict'

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf

const fs = require('fs')



nconf.defaults({
  minDepth: 2,
  maxDepth: 6,
"functionSet":{
    "+":{
      "arity":2
    },
    "-":{
      "arity":2
    },
    "*":{
      "arity":2
    },
    "/":{
      "arity":2
    },
    "^":{
      "arity":2
    },
    "if<=":{
      "arity":4
    },
    "cos":{
      "arity":1
    },
    "sin":{
      "arity":1
    },
    "log":{
      "arity":1
    },
    "exp":{
      "arity":1
    },
    "sqrt":{
      "arity":1
    }
  },
  "variables":['speed1','distance1','distance2','distancediff','going1','going2','goingdiff','datediff','weight1','weight2','weightdiff'],
  "proportions":{
    "functions": 0.5,
    "constants": 0.25,
    "variables": 0.25
  },
  "constants": {
    "nconstants" : 1000,
    "min": -10.0,
    "max": 10.0
  },
  "constantsSet":[],
  "populationsize": 100,
  "datafileurl":"../data/test-100.json",
  "maxSpeedIncrease":0.40340390203403914,
  "maxSpeedDecrease":-0.2880974917179366

})

const GPnode = require('../GPNode/GPnode.js').GPnode

const gpa = require('./gpalgorithm')

nconf.set('constantsSet',gpa.generateConstants(nconf.get('constants').nconstants))


//logger.info(JSON.stringify(nconf.get('constantsSet')))

let population = gpa.generatePopulation(nconf.get('populationsize'))

//logger.info(JSON.stringify(population))

let observations = JSON.parse(fs.readFileSync(nconf.get('datafileurl'),'utf8'))

//logger.info(JSON.stringify(observations))

population = gpa.evaluatePopulation(population, observations, true)

population = gpa.sortPopulation(population)

logger.info(JSON.stringify(population[0]))

logger.info(JSON.stringify(population[99]))
//logger.info(JSON.stringify(population[0].rule.toStrArr()))


/*let node = GPnode.parseNode(["^","cos","if<=","distance2",-2.4729,2.4224,6.7787,"/","+","goingdiff",-5.4948,"sqrt",-0.4587])

    let populationMember = {
      rule:node,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }


  let result = gpa.evaluatePopulationMember(populationMember, observations)

  logger.info(JSON.stringify(result))

*/