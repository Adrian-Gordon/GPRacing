'use strict'

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf

const fs = require('fs')

const toString = require('stream-to-string')

const readline = require('readline')

const request = require('request-promise-native')



nconf.defaults({
"datasourceurl":"http://localhost:8080",
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
    "if<=":{
      "arity":4
    }
   
  },
  "variables":["distancediff","weightdiff","goingdiff"],
  "dependantvariable":"speeddiff",
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
  "epochs": 100,
  'nelite': 5,
  "crossoverrate":0.9,
  "tournamentsize": 5,
  "pointmutationrate":0.05,

})

const GPnode = require('../GPNode/GPnode.js').GPnode

const gpa = require('./gpalgorithm')

const batchsize = nconf.get("batchsize")

const dependantvariable = nconf.get("dependantvariable")

const epochs = nconf.get("epochs")

const populationsize = nconf.get('populationsize')

const nelite = nconf.get('nelite')

const crossoverRate = nconf.get('crossoverrate')

const tournamentSize = nconf.get('tournamentsize')

nconf.set('constantsSet',gpa.generateConstants(nconf.get('constants').nconstants))



const getDataBatch = async(batchSize) => {
  let url = nconf.get("datasourceurl")+"/data"
  if (typeof batchSize != 'undefined'){
    url = nconf.get("datasourceurl")+"/data?n=" + batchSize
  }
  const promise = new Promise((resolve,reject) => {
    request(url)
      .then(data => {
        //console.log("obs: " + JSON.stringify(data))
        resolve(data)
      })
  })
  //const data = await getBatch(batchSize)
  let data = await promise
 // console.log(data)
  return JSON.parse(data)


}

const learnStep = (epoch) => {
  console.log("#Epoch: " + epoch)
  console.log(JSON.stringify(population[0].stats.fitness))
  console.log("#" + population[0].rule.toStrArr())

  //prepare the population for the next generation
  let newPopulation = new Array(populationsize)

  //copy elite members
  for(let i=0; i<nelite; i++){
    newPopulation[i]=population[i]
  }

  //replace poulation members
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

    population = newPopulation

    getDataBatch(batchsize)
    .then(databatch => {
      population = gpa.evaluatePopulation(population, databatch, true, dependantvariable)

      population = gpa.sortPopulation(population)
      if(epoch < epochs){
        learnStep(epoch + 1)
      }
      else{ //print out final result
        console.log("#Epoch: " + epoch)
        console.log(JSON.stringify(population[0].stats.fitness))
        console.log("#" + population[0].rule.toStrArr())
      }
    })
    
}



let population = gpa.generatePopulation(nconf.get('populationsize'))


getDataBatch(batchsize)
.then(databatch => {
  population = gpa.evaluatePopulation(population, databatch, true, dependantvariable)

  population = gpa.sortPopulation(population)

  learnStep(0)

})








