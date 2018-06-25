'use strict'

const nconf = require('../config/conf.js').nconf
//const logger = require('../logger/log.js').logger
const logger = require('../logger/logger')(module)

const GPNode = require('../GPNode/GPnode.js')


nconf.defaults({
  minDepth: 2,
  maxDepth: 6


})

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
    logger.info(depth)
  }


}

generatePopulation(100)