'use strict'

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf

const fs = require('fs')

const toString = require('stream-to-string')

const readline = require('readline')



nconf.defaults({
"minDepth": 2,
"maxDepth": 6,
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
    }
   /* "cos":{
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
    }*/
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
  "maxSpeedDecrease":-0.2880974917179366,
  "ngenerations": 100,
  'nelite': 5,
  "crossoverrate":0.9,
  "tournamentsize": 5,
  "pointmutationrate":0.05

})

const GPnode = require('../GPNode/GPnode.js').GPnode

const gpa = require('./gpalgorithm')

nconf.set('constantsSet',gpa.generateConstants(nconf.get('constants').nconstants))


//logger.info(JSON.stringify(nconf.get('constantsSet')))

let population = gpa.generatePopulation(nconf.get('populationsize'))

//logger.info(JSON.stringify(population))

//const rStream = fs.createReadStream(nconf.get('datafileurl'))

//toString(rStream,'utf-8').then(obs => {
 // console.log(obs)
//})

//const observations = require(nconf.get('datafilename')).dataset

//let observations = JSON.parse(fs.readFileSync(nconf.get('datafileurl'),'utf8'))
const observations = []

const instream = fs.createReadStream(nconf.get('datafilepath'))

const rl = readline.createInterface(instream)

rl.on('line', line => {
  //console.log(line)
  const observation = JSON.parse(line)
  observations.push(observation)
})

rl.on('close', line => {
  //console.log('close:' + line)
  //console.log(observations)
  learn()
})


const learn = () => {
  

  //logger.info(JSON.stringify(observations))

  population = gpa.evaluatePopulation(population, observations, true)

  population = gpa.sortPopulation(population)

  //logger.info(JSON.stringify(population[0]))

  //logger.info(JSON.stringify(population[19]))

  const crossoverRate = nconf.get('crossoverrate')
  const tournamentSize = nconf.get('tournamentsize')

  for(let generation=0; generation< nconf.get('ngenerations');generation++){
    console.log("#GENERATION: " + generation)
    const populationsize = nconf.get('populationsize')

    let newPopulation = new Array(populationsize)

    const nelite = nconf.get('nelite')
    //copy elite members
    for(let i=0; i<nelite; i++){
      newPopulation[i]=population[i]
    }


    for(let i = nelite; i<populationsize; i++){
      if(Math.random() < crossoverRate){ //crossover this member of the population
          let parent1 = gpa.getTournamentWinner(gpa.getTournament(population,tournamentSize))
          let parent2 = gpa.getTournamentWinner(gpa.getTournament(population,tournamentSize))

          let index1 = parent1.rule.selectIndex()
          let index2 = parent2.rule.selectIndex()

          let offspring = GPnode.crossover(parent1.rule, parent2.rule, index1, index2)

          let newPopulationMember = {
            rule:offspring,
            stats:{
              cumulativeError:0,
              nobservations:0,
              fitness:Number.MAX_VALUE
            }
          }

          newPopulation[i] = newPopulationMember
      }
      else{           //mutate
        let tournamentWinner = gpa.getTournamentWinner(gpa.getTournament(population,tournamentSize))
        let crossoverMutateIndex = tournamentWinner.rule.selectIndex()
        let cmDepth = nconf.get('minDepth') +Math.floor(Math.random() * (nconf.get('maxDepth')-nconf.get('minDepth')))
        let mutated = GPnode.subtreeMutate(tournamentWinner.rule, crossoverMutateIndex,cmDepth)

        let mutatedArray = mutated.toArray()

        for(let j=0;j<mutatedArray.length;j++){

            let nodeToMutate=mutatedArray[j]
            let rnd=Math.random()
            //console.log("rnd: "+ rnd)
            if(rnd > nconf.get('pointmutationrate')){
              //logger.info(i + 'point mutate it');
              GPnode.pointMutate(nodeToMutate) //mutates in situ
            }
            else{
              //logger.info(i + 'do not point mutate it');
            }
        }
        let newPopMember={
            rule:mutated,
            stats:{
              cumulativeError:0,
              nobservations:0,
              fitness:Number.MAX_VALUE
            }
          }

          newPopulation[i]=newPopMember;



      }

    }
    //logger.info(JSON.stringify(newPopulation))

    population = newPopulation
    population = gpa.evaluatePopulation(population, observations, true)

    population = gpa.sortPopulation(population)
    console.log(JSON.stringify(population[0].stats.fitness))
    console.log("#" + population[0].rule.toStrArr())

    //logger.info(JSON.stringify(population[19]))

  }
}


