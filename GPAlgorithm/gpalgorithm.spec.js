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

    let observations = [
      {"speed1":15.0,"speed2":15.1,"x": 1},
      {"speed1":15.1,"speed2":15.2,"x":2},
      {"speed1":15.3,"speed2":15.3,"x":3}
    ]

    let result = gpalgorithm.evaluatePopulationMember(populationMember, observations)

    result.stats.fitness.should.be.above("0.29")

    

    done()
  })
})