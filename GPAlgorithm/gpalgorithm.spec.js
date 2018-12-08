'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('../GPNode/GPnode.js').GPnode
const gpalgorithm = require('./gpalgorithm')

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


describe('gpalgorithm', () => {

  if('returns a set of constants', (done) => {

    let constants = gpalgorithm.generateConstants(10)
    constants.length.should.eql(10)
    done()

  })

  it('returns a population', (done) => {
    let constants = gpalgorithm.generateConstants(10)
    nconf.set('constantsSet',constants)
    let population = gpalgorithm.generatePopulation(10)

    population.length.should.eql(10)

    population[0].rule.should.be.instanceOf(GPnode)

    done()
  })

  

  it('evaluates a population member', (done) => {
    let node = GPnode.parseNode(["*", "x", 2.0])

    let populationMember = {
      rule:node,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }

    const observations = [
      {"speed1":15.0,"speed2":15.1,"x": 1},
      {"speed1":15.1,"speed2":15.2,"x":2},
      {"speed1":15.3,"speed2":15.3,"x":3}
    ]

    let result = gpalgorithm.evaluatePopulationMember(populationMember, observations,"speed2")

    result.stats.fitness.should.be.above(0.29)

    

    done()
  })

  it('evaluates a population without elite members', (done) => {
    let node1 = GPnode.parseNode(["*", "speed1", "*","x",2.0])

    let populationMember1 = {
      rule:node1,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node2 = GPnode.parseNode(["*", "speed1", 3.0])

    let populationMember2 = {
      rule:node2,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node3 = GPnode.parseNode(["*", "speed1", 80.0])

    let populationMember3 = {
      rule:node3,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }

    const population = [populationMember1, populationMember2, populationMember3]

    const observations = [
      {"speed1":15.0,"speed2":15.1,"x": 1},
      {"speed1":15.1,"speed2":15.2,"x":2},
      {"speed1":15.3,"speed2":15.3,"x":3}
    ]

    let result = gpalgorithm.evaluatePopulation(population, observations, true, "speed2")

     result.should.be.instanceOf(Array)
     result[0].stats.nobservations.should.eql(3)
     result[0].stats.fitness.should.be.above(0.0)
     result[0].stats.cumulativeError.should.be.above(0.0)
     result[1].stats.nobservations.should.eql(3)
     result[1].stats.fitness.should.be.above(0.0)
     result[1].stats.cumulativeError.should.be.above(0.0)
     result[2].stats.nobservations.should.eql(3)
     result[2].stats.fitness.should.be.above(0.0)
     result[2].stats.cumulativeError.should.be.above(0.0)
    done()
  })

  it('evaluates a population with elite members', (done) => {
    let node1 = GPnode.parseNode(["*", "speed1", "*","x",2.0])

    let populationMember1 = {
      rule:node1,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node2 = GPnode.parseNode(["*", "speed1", 3.0])

    let populationMember2 = {
      rule:node2,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node3 = GPnode.parseNode(["*", "speed1", 80.0])

    let populationMember3 = {
      rule:node3,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }

    const population = [populationMember1, populationMember2, populationMember3]

    const observations = [
      {"speed1":15.0,"speed2":15.1,"x": 1},
      {"speed1":15.1,"speed2":15.2,"x":2},
      {"speed1":15.3,"speed2":15.3,"x":3}
    ]

    let result = gpalgorithm.evaluatePopulation(population, observations, false, "speed2")

     result.should.be.instanceOf(Array)
     result[0].stats.nobservations.should.eql(0)
     result[0].stats.fitness.should.eql(0.0)
     result[0].stats.cumulativeError.should.eql(0.0)
     result[1].stats.nobservations.should.eql(0)
     result[1].stats.fitness.should.eql(0.0)
     result[1].stats.cumulativeError.should.eql(0.0)
     result[2].stats.nobservations.should.eql(3)
     result[2].stats.fitness.should.be.above(0.0)
     result[2].stats.cumulativeError.should.be.above(0.0)
    done()
  })

   it('sorts a population', (done) => {
    let node1 = GPnode.parseNode(["*", "speed1", "*","x",2.0])

    let populationMember1 = {
      rule:node1,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node2 = GPnode.parseNode(["*", "speed1", 3.0])

    let populationMember2 = {
      rule:node2,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }
    let node3 = GPnode.parseNode(["*", "speed1", 80.0])

    let populationMember3 = {
      rule:node3,
      stats:{
        cumulativeError:0.0,
        nobservations: 0,
        fitness: 0.0
      }
    }

    const population = [populationMember1, populationMember2, populationMember3]

    const observations = [
      {"speed1":15.0,"speed2":15.1,"x": 1},
      {"speed1":15.1,"speed2":15.2,"x":2},
      {"speed1":15.3,"speed2":15.3,"x":3}
    ]

    let evaluatedPopulation = gpalgorithm.evaluatePopulation(population, observations, true, "speed2")

    let sortedPopulation = gpalgorithm.sortPopulation(evaluatedPopulation)

  
     sortedPopulation[0].stats.fitness.should.be.below(sortedPopulation[1].stats.fitness)
     
     sortedPopulation[1].stats.fitness.should.below(sortedPopulation[2].stats.fitness)
     
    
    done()
  })

   it("returns a tournament", (done) => {
     let population = new Array(10)

     for(let i=0; i< population.length; i++){
      population[i] = {
        stats:{
        cumulativeError:0.0,
        nobservations: 0
      }
      }
    }

    let tournament = gpalgorithm.getTournament(population, 5)
    tournament.length.should.eql(5)
    done()
   })

  it("returns a tournament result", (done) => {
    let tournament = new Array(5)

    for(let i=0; i< tournament.length; i++){
      tournament[i] = {
        stats:{
        cumulativeError:0.0,
        nobservations: 0
      }
      }
    }

    tournament[0].stats.fitness = 0.11
    tournament[1].stats.fitness = 0.12
    tournament[2].stats.fitness = 0.05
    tournament[3].stats.fitness = 0.13
    tournament[4].stats.fitness = 0.14


    let tournamentWinner = gpalgorithm.getTournamentWinner(tournament)

    tournamentWinner.stats.fitness.should.eql(0.05)

    done()

  })
})