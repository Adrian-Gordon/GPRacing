'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('./GPnode').GPnode

describe('GPnode', () => {

  

  it('throws an error if no type is provided', (done) => {

    assert.throws(() => new GPnode({}),Error, "no node type provided")
   // const newnode = new GPnode({})
    //newnode.type.should.equal('function')
    done()
  })
   it('throws an error if an invalid type is provided', (done) => {

    assert.throws(() => new GPnode({type: 'fizzbang'}),Error, "invalid node type: fizzbang")
   // const newnode = new GPnode({})
    //newnode.type.should.equal('function')
    done()
  })
})