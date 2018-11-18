'use strict'

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf






const GPnode = require('../GPNode/GPnode.js').GPnode

const generateConstants = (nconstants) => {
  let constants = new Array(nconstants)
  for (let i=0; i< constants.length; i++){
    constants[i] = (Math.random()*(nconf.get('constants').max - nconf.get('constants').min) + nconf.get('constants').min).toFixed(4)
  }
   
  
  return(constants)
}





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

const evaluatePopulation = (population, observations, all) => {
  let start = 0
  if(!all){
    start = nconf.get("nelite")
  }

  for(let i=start; i< population.length; i++){
    let populationMember = population[i]
    evaluatePopulationMember(populationMember, observations)
  }

  //logger.info(JSON.stringify(population))
  return population
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
 // logger.info('rule min: ' + min)
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
     
      obs.val=rule.eval(obs)
     
     // obs.predictedProportion=(obs.val - rule.minfofx)/(rule.maxfofx - rule.minfofx)
     // obs.predictedChange = maxDecrease + (obs.predictedProportion  *( maxIncrease - maxDecrease))
    //  obs.actualChange=((obs.speed2 - obs.speed1)/obs.speed1)
     // obs.error = GPnode.squaredError(obs.predictedChange,obs.actualChange)

     obs.error = GPnode.squaredError(obs.val,obs.speed2)

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

const sortPopulation = (population) => {
  return(population.sort((a,b) => {
    if(a.stats.fitness < b.stats.fitness)return(-1)
    else if(a.stats.fitness > b.stats.fitness)return(1)
    else return(0)
  }))
}

const getTournamentWinner = (tournament) => {

    tournament.sort(((a,b) => {
      if(a.stats.fitness < b.stats.fitness)return(-1)
      else if(a.stats.fitness > b.stats.fitness)return(1)
      else return(0)
    }))
    return(tournament[0])
}

const getTournament = (population, tournamentSize) => {
  let tournament = new Array(tournamentSize)
  for(let i = 0; i< tournamentSize; i++){
    let index = Math.floor(Math.random() *population.length)
    tournament[i] = population[index]
  }

  return(tournament)
}





//generatePopulation(10)

module.exports = Object.assign({}, {evaluatePopulation, evaluatePopulationMember, generateConstants, generatePopulation, sortPopulation, getTournament,getTournamentWinner})

