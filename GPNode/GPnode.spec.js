'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('./GPnode').GPnode

describe('GPnode', () => {

  

  it('throws an error if no type is provided', (done) => {

    assert.throws(() => new GPnode({}),Error, "no node type provided")

    done()
  })
  it('throws an error if an invalid type is provided', (done) => {

    assert.throws(() => new GPnode({'type': 'fizzbang'}),Error, "invalid node type: fizzbang")
   
    done()
  })

  it('throws an error if a variable does not have a variablename', (done) => {

    assert.throws(() => new GPnode({'type': 'variable'}),Error, "a variable must have a variablename")
   
    done()
  })

  it('throws an error if a function does not have a functionname', (done) => {

    assert.throws(() => new GPnode({'type': 'function'}),Error, "a function must have a functionname")
   
    done()
  })

  it('throws an error if a function does not have a functionname that is in the valid set of function names', (done) => {

    assert.throws(() => new GPnode({'type': 'function','functionname':'if=<'}),Error, "invalid functionname: 'if=<'")
   
    done()
  })

  it('throws an error if a constant does not have a value', (done) => {

    assert.throws(() => new GPnode({'type': 'constant'}),Error, "a constant must have a value")
   
    done()
  })

  it('correctly creates the arguments of a function when none are provided', (done) => {
    let node = new GPnode({'type': 'function','functionname': 'if<='})

    node.arity.should.eql(4)
    node.arguments.length.should.eql(4)

    done()

  })

  it('correctly creates the arguments of a function when arguments are provided', (done) => {
    let node = new GPnode({'type': 'function','functionname': 'if<=','args':[1,2,3,4]})

    node.arity.should.eql(4)
    node.arguments.length.should.eql(4)
    node.arguments[0].should.eql(1)

    done()

  })

  it('returns a copy of a constant', (done) => {
    let node = new GPnode({'type':'constant', 'value': 4})
    let copy = node.copy()
    copy.type.should.eql('constant')
    copy.value.should.eql(4)

    done()
  })

  it('returns a copy of a variable', (done) => {
    let node = new GPnode({'type':'variable', 'variablename': 'x','value': 4})
    let copy = node.copy()
    copy.type.should.eql('variable')
    copy.variablename.should.eql('x')
    copy.value.should.eql(4)


    done()
  })

  it('returns a copy of a function, with recursively constructed arguments', (done) => {
    let node1 = new GPnode({'type':'constant','value': 4})
    let node2 = new GPnode({'type':'constant','value': 5})
    let node3 = new GPnode({'type':'function','functionname':'+','args':[node1, node2]})

    let copy = node3.copy()

    copy.type.should.eql('function')
    copy.functionname.should.eql('+')
    copy.arguments.length.should.eql(2)
    copy.arguments[0].type.should.eql('constant')
    copy.arguments[0].value.should.eql(4)
    copy.arguments[1].type.should.eql('constant')
    copy.arguments[1].value.should.eql(5)

    done()

  })

  it('evaluates a constant', (done) => {
    let node = new GPnode({'type':'constant','value': 4.27})

    let val = node.eval({})

    val.should.eql(4.27)

    done()
  })
 /* it('throws an error when evaluating a variable if the variable is not a valid variable ', (done) => {
    let node = new GPnode({'type':'variable','variablename':'a'})

     assert.throws(() => node.eval({}),Error, "not a valid variable: 'a'")

     done()
  })*/


  it('throws an error when evaluating a variable if the variable binding is not found', (done) => {
    let node = new GPnode({'type':'variable','variablename':'x'})

     assert.throws(() => node.eval({}),Error, "variablebindingnotfound: 'x'")

     done()
  })

  it('evaluates a variable', (done) => {
    let node = new GPnode({'type':'variable','variablename':'x'})

    node.eval({'x':132.7}).should.eql(132.7)

    done()
  })

  it('throws an error when a function is provided with the wrong number of arguments', (done)=> {

    let node1 = new GPnode({'type':'constant','value': 4.27})
    let node2 = new GPnode({'type':'function','functionname':'+','args':[node1]})
    assert.throws(() => node2.eval({}),Error, "wrong number of arguments to function: '+'")
    done()
  })

  it('evaluates + function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.27})
    let node2 = new GPnode({'type':'variable','variablename':'x'})
    let node3 = new GPnode({'type':'function','functionname':'+','args':[node1, node2]})

    node3.eval({'x':2}).should.eql(6.27)

    done()

  })

  it('evaluates - function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'variable','variablename':'x'})
    let node3 = new GPnode({'type':'function','functionname':'-','args':[node1, node2]})

    node3.eval({'x':2.0}).should.eql(2.0)

    done()

  })
  it('evaluates * function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'variable','variablename':'x'})
    let node3 = new GPnode({'type':'function','functionname':'*','args':[node1, node2]})

    node3.eval({'x':2.0}).should.eql(8.0)

    done()

  })

  it('evaluates / function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'variable','variablename':'x'})
    let node3 = new GPnode({'type':'function','functionname':'/','args':[node1, node2]})

    node3.eval({'x':2.0}).should.eql(2.0)

    done()

  })
  it('evaluates ^ function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'variable','variablename':'x'})
    let node3 = new GPnode({'type':'function','functionname':'^','args':[node1, node2]})

    node3.eval({'x':2.0}).should.eql(16.0)

    done()

  })

  it('evaluates the if<= function, correctly returning the first argument', (done) => {
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'constant','value': 5.0})
    let node3 = new GPnode({'type':'constant','value': 100.0})
    let node4 = new GPnode({'type':'constant','value': 200.0})

    let node5 = new GPnode({'type':'function','functionname':'if<=','args':[node1, node2, node3, node4]})

    node5.eval({}).should.eql(100.0)

    done()

  })

  it('evaluates the if<= function, correctly returning the second argument', (done) => {
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node2 = new GPnode({'type':'constant','value': 3.0})
    let node3 = new GPnode({'type':'constant','value': 100.0})
    let node4 = new GPnode({'type':'constant','value': 200.0})

    let node5 = new GPnode({'type':'function','functionname':'if<=','args':[node1, node2, node3, node4]})

    node5.eval({}).should.eql(200.0)

    done()

  })

  it('evaluates cos function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node3 = new GPnode({'type':'function','functionname':'cos','args':[node1]})

    node3.eval({}).should.eql(Math.cos(4.0))

    done()

  })

  it('evaluates sin function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node3 = new GPnode({'type':'function','functionname':'sin','args':[node1]})

    node3.eval({}).should.eql(Math.sin(4.0))

    done()

  })

  it('evaluates exp function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node3 = new GPnode({'type':'function','functionname':'exp','args':[node1]})

    node3.eval({}).should.eql(Math.exp(4.0))

    done()

  })
  it('evaluates log function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node3 = new GPnode({'type':'function','functionname':'log','args':[node1]})

    node3.eval({}).should.eql(Math.log(4.0))

    done()

  })
  it('evaluates log function for negative numbers', (done) =>{
    let node1 = new GPnode({'type':'constant','value': -4.0})
    let node3 = new GPnode({'type':'function','functionname':'log','args':[node1]})

    node3.eval({}).should.eql(Math.log(4.0))

    done()

  })

  it('evaluates sqrt function', (done) =>{
    let node1 = new GPnode({'type':'constant','value': 4.0})
    let node3 = new GPnode({'type':'function','functionname':'sqrt','args':[node1]})

    node3.eval({}).should.eql(Math.sqrt(4.0))

    done()

  })

  
})

describe('GPnode.parseNode', () => {
  it('throws an error when trying to parse a non-array argument', (done) =>{
     assert.throws(() => GPnode.parseNode(2.175),Error, "argument to parseNode should be an array")
     done()

  })

  it('throws an error when trying to parse an invalid token', (done) =>{
     assert.throws(() => GPnode.parseNode(["testtoken"]),Error, "invalid token: 'testtoken'")
     done()

  })

  it('parses a constant', (done) => {
    let node = GPnode.parseNode([2.175])
    node.type.should.eql('constant')
    node.value.should.eql(2.175)
    done()
  })

  it('parses a variable', (done) => {
    let node = GPnode.parseNode(["x"])
    node.type.should.eql('variable')
    node.variablename.should.eql("x")
    done()
  })

  it('parses a function of arity 1', (done) => {
    let node = GPnode.parseNode(["cos", 2.1])
    node.type.should.eql('function')
    node.functionname.should.eql('cos')
    node.arguments.length.should.eql(1)
    done()
  })

   it('parses a function of arity 2', (done) => {
    let node = GPnode.parseNode(["+", 2.1, 3.5])
    node.type.should.eql('function')
    node.functionname.should.eql('+')
    node.arguments.length.should.eql(2)
    done()
  })

  it('parses a function of arity 4', (done) => {
    let node = GPnode.parseNode(["if<=", 2.1, 3.5, 10.0, "x"])
    node.type.should.eql('function')
    node.functionname.should.eql('if<=')
    node.arguments.length.should.eql(4)
    done()
  })

  it('parses a valid complex expression', (done) => {
    let node = GPnode.parseNode(["if<=", "cos", 3.5, 10.0, "x", "+", 10, "*", 100, "cos",3.1])
    node.type.should.eql('function')
    node.functionname.should.eql('if<=')
    node.arguments.length.should.eql(4)
    node.arguments[3].type.should.eql('function')
    node.arguments[3].functionname.should.eql('+')
    node.arguments[3].arguments.length.should.eql(2)
    done()
  })

  describe('GPnode print', () => {
    it('prints an array for a node', (done) => {
      let node = GPnode.parseNode(["if<=", "cos", 3.5, 10.0, "x", "+", 10, "*", 100, "cos",3.1])
      let strArr = node.toStrArr()
      //console.log(node.printStr(10, true))
      strArr.should.eql("\"if<=\",\"cos\",3.5,10,\"x\",\"+\",10,\"*\",100,\"cos\",3.1,")
      done()
    })
  })





})