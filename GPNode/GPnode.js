'use strict'


const nconf = require('../config/conf.js').nconf
const logger = require('../logger/log.js').logger


let _GPnode_nodeid=0

const functionSet = nconf.get('functionSet')



class GPnode {
  constructor ({type, functionname, variablename, value, args}){
    this.id =  _GPnode_nodeid++
    this.type = type
    this.functionname = functionname
    this.variablename = variablename
    this.value = value

   
    if(typeof type == 'undefined'){
      throw new Error('no node type provided')
    }

    if((type !== 'variable')&&(type !== 'constant')&&(type !== 'function')){
      throw new Error('invalid node type: ' + type)
    }

    if(typeof this.functionname != 'undefined')
      this.arity = functionSet[this.functionname].arity


  }

}


module.exports = Object.assign({}, {GPnode})