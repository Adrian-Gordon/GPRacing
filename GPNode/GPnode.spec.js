'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('./GPnode').GPnode
const nconf = require('../config/conf.js').nconf

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

  it('fails to parse an invalid complex expression', (done) => {
    //let node = GPnode.parseNode(["if<=", "x",10, "*", "+", 5.6, "sin", "y"])
    //console.log(node.printStr(10, true))
     assert.throws(() => GPnode.parseNode(["if<=", "x",10, "*", "+", 5.6, "sin", "y"]),Error, "failed to parse invalid array expression")
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

  describe('GPnode Genetic Operators', () => {

    before(() => {
      let constants = new Array(nconf.get('constants').nconstants)
      for (let i=0; i< constants.length; i++){
        constants[i] = (Math.random()*(nconf.get('constants').max - nconf.get('constants').min) + nconf.get('constants').min).toFixed(4)
      }
      nconf.set('constantsSet',constants)
    })

    it('generates a terminal node when depth is 0', (done) => {
      let node = GPnode.generateNode(0,)

      node.type.should.be.equalOneOf(['constant','variable'])
      done()
    })

    it('generates a function node of depth 1', (done) => {
      let node = GPnode.generateFunctionNode(1)

      node.type.should.eql('function')
      node.arguments[0].type.should.be.equalOneOf(['constant','variable']) //first argument should be a terminal node

      if(node.arity == 2) node.arguments[1].type.should.be.equalOneOf(['constant','variable']) //second argument should be a terminal node

      if(node.arity == 4){
        node.arguments[2].type.should.be.equalOneOf(['constant','variable']) //second argument should be a terminal node
        node.arguments[3].type.should.be.equalOneOf(['constant','variable']) //second argument should be a terminal node


      }
      done()
    })

    it("generates a 'full' strategy node of depth 2", (done) => {

      let node = GPnode.generateNode(2,'full')

      node.type.should.eql('function')
      node.arguments[0].type.should.eql('function') //first argument should be a function node
      node.arguments[0].arguments[0].type.should.be.equalOneOf(['constant','variable']) //its child should be terminal

      if(node.arity == 2) node.arguments[1].type.should.eql('function') //second argument should be a function node

      if(node.arity == 4){
        node.arguments[2].type.should.eql('function') //second argument should be a function node
        node.arguments[3].type.should.eql('function') //second argument should be a function node


      }

      done()
    })

    it("generates a 'full' strategy node of depth 6", (done)=> {
      let node = GPnode.generateNode(6, 'full')
      node.type.should.eql('function')
     // console.log(node.printStr(6,true))
      done()

    })

    it("generates a 'grow' strategy node of depth 6", (done)=> {
      let node = GPnode.generateNode(6, 'grow')
      node.type.should.be.equalOneOf(['constant','variable','function'])
     // console.log(node.printStr(6,true))
      done()

    })

    it("does a crossoverReplace of one node for another - base case", (done)=> {
      let node1 = new GPnode({'type':'function','functionname': '+'})
      let node2 = new GPnode({'type':'constant', 'value': 10})
      let node3 = new GPnode({'type':'constant', 'value': 20})
      let node4 = new GPnode({'type':'constant', 'value': 40})

      node1.arguments = [node2,node3]

      GPnode.crossoverReplace(node1,node3,node4)

      node1.arguments[1].id.should.eql(node4.id)

      done()

    })

    it("does a crossoverReplace of one node for another - recursive case", (done)=> {

      "+ 10 - 20 5, becomes + 10 - 20 40"
      let node1 = new GPnode({'type':'function','functionname': '+'})
      let node2 = new GPnode({'type':'constant', 'value': 10})
      
      let node3 = new GPnode({'type':'function','functionname': '-'})

      let node4 = new GPnode({'type':'constant', 'value': 20})

      let node5 = new GPnode({'type':'constant', 'value': 5})

      

      let node6 = new GPnode({'type':'constant', 'value': 40})

      node1.arguments = [node2,node3]
      node3.arguments = [node4, node5]

      GPnode.crossoverReplace(node1,node5,node6)

      node1.arguments[1].arguments[1].id.should.eql(node6.id)

      done()

    })

    it("performs a crossover operation", (done) => {

      let node1 = GPnode.parseNode(["+","-",10,"*","cos","x",5,"y"])
      let node2 = GPnode.parseNode(["if<=","x",10,"+",5,6,"sin","y"])
      //console.log(node1.printStr(6,true))
     // console.log(node2.printStr(6,true))

      let node = GPnode.crossover(node1,node2,2,3)
      //console.log(node.printStr(6,true))

      node.arguments[0].arguments[0].type.should.eql('function')
      node.arguments[0].arguments[0].functionname.should.eql('+')

      done()

    })

    
  })



})