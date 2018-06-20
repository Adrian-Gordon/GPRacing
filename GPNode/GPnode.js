'use strict'


const nconf = require('../config/conf.js').nconf
const logger = require('../logger/log.js').logger


let _GPnode_nodeid=0

const functionSet = nconf.get('functionSet')



class GPnode {
  constructor ({type, functionname, variablename, value, args}){
   
    if(typeof type == 'undefined'){
      throw new Error('no node type provided')
    }

    if((type !== 'variable')&&(type !== 'constant')&&(type !== 'function')){
      throw new Error('invalid node type: ' + type)
    }

     //a variable must have a name

    if((type === 'variable')&&(typeof variablename == 'undefined')){
      throw new Error('a variable must have a variablename')
    }
    //it must be a defined variable

    if((type === 'variable')&&!this.inArray(variablename,nconf.get('variables'))){
      throw new Error("not a valid variable: '" + variablename + "'")
    }
   

    //a function must have a name

     if((type === 'function')&&(typeof functionname == 'undefined')){
      throw new Error('a function must have a functionname')
    }

     //a function must have a name that is in the valid set of functionnames

    if(type === 'function'){
      if(typeof functionSet[functionname] == 'undefined')
      throw new Error("invalid functionname: '" + functionname + "'")
    }

    //a constant must have a value

     if((type === 'constant')&&(typeof value == 'undefined')){
      throw new Error('a constant must have a value')
    }

    if(type === 'function'){

      this.arity = functionSet[functionname].arity
    }

    this.id =  _GPnode_nodeid++
    this.type = type
    this.functionname = functionname
    this.variablename = variablename
    this.value = value

    if(type =='function' && typeof args != 'undefined'){
      this.arguments = args
    }
    else if(type == 'function'){
      this.arguments = new Array(this.arity)
    }

  }

  copy(){
    let newNode = new GPnode({type:this.type, functionname:this.functionname, variablename:this.variablename, value:this.value})

    if(this.type=='function'){
       newNode.arguments=new Array(this.arity);

      for(var i=0;i<this.arity;i++){
        newNode.arguments[i]=this.arguments[i].copy();
      }
    }
    return(newNode)
  }

  eval(variableBindings){
    
    if(this.type == 'constant'){
      return(this.value)
    }
    else if(this.type == 'variable'){
      let val = variableBindings[this.variablename]

      if(typeof val == 'undefined')
        throw new Error("variablebindingnotfound: '" + this.variablename + "'")
      else return(val)
    }
  else if(this.type == 'function'){

    //evaluate its arguments
    let argVals=new Array(this.arity);

    if(this.arity !== this.arguments.length){
      throw new Error("wrong number of arguments to function: '" + this.functionname + "'")
    }

    for(var i=0;i<this.arity;i++){
      argVals[i]=this.arguments[i].eval(variableBindings)
    }
    if(this.functionname=='+'){
      var rval=parseFloat(argVals[0]) + parseFloat(argVals[1])
      if(isNaN(rval)){
        
        return(0.0)
      }
      return(rval)
    }
    else if(this.functionname=='-'){
      var rval=parseFloat(argVals[0]) - parseFloat(argVals[1])
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='*'){
      var rval=parseFloat(argVals[0]) * parseFloat(argVals[1])
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='/'){
      var rval=parseFloat(argVals[0]) / parseFloat(argVals[1])
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='^'){
      //logger.info(JSON.stringify(argVals));
      var rval=Math.pow(argVals[0], Math.floor(argVals[1]))
      if(!isFinite(rval)){
        rval=Number.MAX_VALUE
      }
      if(isNaN(rval)){
        //logger.info(JSON.stringify(this) + JSON.stringify(argVals))
        return(0)
      }
      return(rval);
      
    }
    else if(this.functionname=='if<='){
      if(argVals[0] <= argVals[1]){
        rval=argVals[2]
        if(isNaN(rval)){
          //logger.info(JSON.stringify(this) + JSON.stringify(argVals))
          return(0)
        }
        return(rval)
      }
      else{
        rval=argVals[3]
        if(isNaN(rval)){
          //logger.info(JSON.stringify(this) + JSON.stringify(argVals))
          return(0)
        }
        return(rval);
      }
    }
    else if(this.functionname=='cos'){
      var rval=Math.cos(parseFloat(argVals[0]))
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='sin'){
      var rval=Math.sin(parseFloat(argVals[0]))
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='exp'){
      var rval=Math.exp(parseFloat(argVals[0]))
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    else if(this.functionname=='log'){
      let arg = parseFloat(argVals[0])
      if(arg < 0) arg = -1.0 * arg
      var rval=Math.log(arg)
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
     else if(this.functionname=='sqrt'){
      let arg = parseFloat(argVals[0])
      if(arg < 0) arg = -1.0 * arg
      var rval=Math.sqrt(arg)
      if(isNaN(rval)){
        return(0.0)
      }
      return(rval);
      
    }
    

  }

    

  }

inArray(token,array){

  for(var i=0;i<array.length;i++){
    if(token == array[i])return(true)
  }

  return(false)
}

  



}


module.exports = Object.assign({}, {GPnode})