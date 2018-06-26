'use strict'

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf



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
  "variables":["x","y","z"],
  "proportions":{
    "functions": 0.5,
    "constants": 0.25,
    "variables": 0.25
  },
  "constants": {
    "nconstants" : 10,
    "min": -10.0,
    "max": 10.0
  },
  "constantsSet":[]

})

let constants = new Array(nconf.get('constants').nconstants)
for (let i=0; i< constants.length; i++){
    constants[i] = (Math.random()*(nconf.get('constants').max - nconf.get('constants').min) + nconf.get('constants').min).toFixed(4)
}
   
nconf.set('constantsSet',constants)


const GPnode = require('../GPNode/GPnode.js').GPnode

let population




//generate a poulation using ramped half-and-half

const generatePopulation = (populationSize) => {
  const minDepth = nconf.get("minDepth")
  const maxDepth = nconf.get("maxDepth")
  const depthDiff = maxDepth - minDepth
  const incrementPeriod = populationSize / depthDiff

  let incrementCounter = 0
  let depth = minDepth
  let strategy = "full"

  population = new Array(populationSize)

  for(let i=0;i < populationSize;i++){
    incrementCounter++
    if(incrementCounter > incrementPeriod){
      incrementCounter = 0
      depth++

    }

    let gpNode

    if(strategy == "grow"){
      gpNode = GPnode.generateFunctionNode(depth,strategy)
    }
    else{
      gpNode = GPnode.generateNode(depth,strategy)
    }

    let obj={
      rule:gpNode,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }

    population[i] = obj

    if(strategy == "full"){
      strategy = "grow"
    }
    else{
      strategy = "full"
    }

  }


}




generatePopulation(10)

