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






//generate a poulation using ramped half-and-half

const generatePopulation = (populationSize) => {
  const minDepth = nconf.get("minDepth")
  const maxDepth = nconf.get("maxDepth")
  const depthDiff = maxDepth - minDepth
  const incrementPeriod = populationSize / depthDiff

  let incrementCounter = 0
  let depth = minDepth
  let strategy = "full"

  const population = new Array(populationSize)

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

  return(population)


}

const evaluatePopulationMember = (populationMember, observations) => {

 let rule=populationMember.rule
 
  //Once through, to get min and max values of the function
  let min
  let max
  for(let i=0;i<observations.length;i++){
    let obs=observations[i]
    if(obs.speed1!== null && obs.speed2 !== null){
  
   
     
      obs.val=rule.eval(obs)

      //logger.info(obs.val)

      if(typeof min == 'undefined' && typeof max == 'undefined'){
        min = max = obs.val
      }
      if(obs.val > max)max=obs.val
      if(obs.val < min)min=obs.val
    }

  }
//  logger.info('rule min: ' + min)
 //logger.info('rule max: ' + max)

  rule.minfofx=min
  rule.maxfofx=max

  let maxIncrease = nconf.get("maxSpeedIncrease")
  let maxDecrease = nconf.get("maxSpeedDecrease")

  //logger.info(maxIncrease + " " + maxDecrease)

  for(let i=0;i<observations.length;i++){
  //  for(var i=0;i<10;i++){
    let obs=observations[i]
    if(obs.speed1!== null && obs.speed2 !== null){
     
      
      obs.predictedProportion=(obs.val - rule.minfofx)/(rule.maxfofx - rule.minfofx)
      obs.predictedChange = maxDecrease + (obs.predictedProportion  *( maxIncrease - maxDecrease))
      obs.actualChange=((obs.speed2 - obs.speed1)/obs.speed1)
      obs.error = GPnode.squaredError(obs.predictedChange,obs.actualChange)

      populationMember.stats.cumulativeError=populationMember.stats.cumulativeError + obs.error
      populationMember.stats.nobservations=populationMember.stats.nobservations+1;


      //logger.info(JSON.stringify(obs))
     
    }
  }

  populationMember.stats.fitness=Math.sqrt(populationMember.stats.cumulativeError / populationMember.stats.nobservations)
  //logger.info("Fitness: " + pm.stats.fitness);
  if(populationMember.stats.fitness==Infinity){
    //logger.info("FITNESS INFINITY");
    populationMember.stats.fitness=Number.MAX_VALUE;
  }
  if(populationMember.stats.fitness==null){
    //logger.info("FITNESS NULL");
    populationMember.stats.fitness=Number.MAX_VALUE;
  }
  if( isNaN(populationMember.stats.fitness)){
    //logger.info("FITNESS NAN");
    populationMember.stats.fitness=Number.MAX_VALUE;
  }

  //logger.info(JSON.stringify(populationMember))


  return populationMember
}




//generatePopulation(10)

module.exports = Object.assign({}, {evaluatePopulationMember, generatePopulation})

