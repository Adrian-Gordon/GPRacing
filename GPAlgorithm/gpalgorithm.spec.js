'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('../GPNode/GPnode.js').GPnode
const gpalgorithm = require('./gpalgorithm')


describe('gpalgorithm', () => {

  it('returns a population', (done) => {
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

    let result = gpalgorithm.evaluatePopulationMember(populationMember, observations)

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

    let result = gpalgorithm.evaluatePopulation(population, observations, true)

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

    let result = gpalgorithm.evaluatePopulation(population, observations, false)

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

   it('sorts a poulation', (done) => {
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

    let evaluatedPopulation = gpalgorithm.evaluatePopulation(population, observations, true)

    let sortedPopulation = gpalgorithm.sortPopulation(evaluatedPopulation)

  
     sortedPopulation[0].stats.fitness.should.be.below(sortedPopulation[1].stats.fitness)
     
     sortedPopulation[1].stats.fitness.should.below(sortedPopulation[2].stats.fitness)
     
    
    done()
  })
})