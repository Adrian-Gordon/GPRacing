'use strict'



const nconf = require('../config/conf.js').nconf


const logger = require('../logger/logger.js')(module)


let _GPnode_nodeid=0



const functionSet = nconf.get('functionSet')
const variableSet = nconf.get('variables')



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

    if((type === 'variable')&&!GPnode.inArray(variablename,variableSet)){
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

/* predict */

predict(variablebindings, minFx, maxFx, maxDecrease, maxIncrease){

  const val = this.eval(variablebindings)

  const proportion = (val - minFx) / (maxFx - minFx)

  const prediction = maxDecrease + proportion *(maxIncrease - maxDecrease)

  return(prediction)


}

static squaredError(predicted, observed){
  return Math.pow(predicted - observed, 2)
}

  /*Genetic Operators*/

  static generateNode(depth, strategy){
    const f = nconf.get('proportions').functions

    const c = nconf.get('proportions').constants

    const v = nconf.get('proportions').variables

    if(depth == 0){ //randomly generate a terminal
      const r = Math.random()
      if(r > (c /(c + v))){
        //generate a constant

        const cSet = nconf.get('constantsSet')
        const rc=cSet[Math.floor(Math.random() * cSet.length)]

        let newNode = new GPnode({'type':'constant','value': rc})
        return(newNode)
      }
      else{
        //generate a variable
        var va = nconf.get('variables')
        var rv = variableSet [Math.floor(Math.random() * va.length)]
        var newNode = new GPnode({'type':'variable','variablename': rv})
        return(newNode)
      }


    }
    else if(strategy == "grow"){  //generate a terminal or function
        let r = Math.random()

        if(r>((c+f)/(c+f+v))){//generate a variable
            let va = nconf.get('variables')
            let rv = va[Math.floor(Math.random() * va.length)]
            let newNode = new GPnode({'type':'variable','variablename': rv})
            return(newNode)
          }
          else if(r>(c/(c+f+v))){//generate a constant
            const cSet = nconf.get('constantsSet')
            let rc = cSet[Math.floor(Math.random() * cSet.length)]

            let newNode = new GPnode({'type':'constant','value': rc})
            return(newNode)
          }
          else{       //generate a function
            return(GPnode.generateFunctionNode(depth,strategy))

          }
    }
    else if(strategy == "full"){
      return GPnode.generateFunctionNode(depth, strategy)
    }


  }

 static generateFunctionNode(depth, strategy){
    let fa=nconf.get('functionSet');
    let keys = Object.keys(fa)
    let rf=keys[Math.floor(Math.random() * keys.length)]

    let newNode=new GPnode({'type':'function','functionname':rf});

    let arity=newNode.arity;

    for(let i=0;i<arity;i++){
      newNode.arguments[i]=GPnode.generateNode(depth -1,strategy);
    }

    return(newNode);


  }


  static  crossover(node1,node2,index1,index2){
      //logger.info("parent1: \n" + node1.printStr(0,true));
      //logger.info("parent2: \n" + node2.printStr(0,true));
      //logger.info("index1: " + index1 + " index2: " + index2);

      let node1Copy = node1.copy()
      let node2Copy = node2.copy()

      let node1Arr = node1Copy.toArray()
      let node2Arr = node2Copy.toArray()

      let toReplace=node1Arr[index1]
      let replacement=node2Arr[index2]

      //logger.info("toReplace: \n" + toReplace.printStr(0,true));
      //logger.info("replacement: \n" + replacement.printStr(0,true));

      GPnode.crossoverReplace(node1Copy,toReplace,replacement)

   return(node1Copy)



  }

   static crossoverReplace(node,replace,replacement){
  //logger.info("crossoveReplace: " + node.id);

  if(node.type=='function'){
    //logger.info(node.id + " arguments: " + node.arguments);

    for(let i=0;i<node.arguments.length;i++){

      let arg=node.arguments[i]
      //logger.info("crossoveReplace,check : " + arg.id);
      if(arg.id===replace.id){
        node.arguments[i]=replacement
        //logger.info("found it");
        break;
      }
      else if(arg.type=='function'){
        //logger.info("go call cr: " + arg.id);
        GPnode.crossoverReplace(arg,replace,replacement)
      }
    }
  }
  return(node)

}

static pointMutate(node){

  if(node.type == 'function'){
    let functionSet=nconf.get('functionSet')
    let functionname = node.functionname
    let arity = node.arity
    let keys = Object.keys(functionSet)
    keys = keys.filter((key) =>{
      if((key != node.functionname)&&(functionSet[key].arity == arity))return(true)
      return(false)
    })

    if(keys.length > 0){
      let index = Math.floor(Math.random() * keys.length)
      node.functionname = keys[index]
    }
    
     
  }
  else if(node.type == 'constant'){
    
      const cSet = nconf.get('constantsSet').filter((c) => {if(c != node.value)return(true);return(false)})
      node.value = cSet[Math.floor(Math.random() * cSet.length)]
      //console.log(node.value)
     

  }
  else if(node.type == 'variable'){
    let variables = nconf.get('variables').filter((v) => {if(v != node.variablename)return(true);return(false)})
    node.variablename = variables[Math.floor(Math.random() * variables.length)]

    //console.log(node.variablename)
    
  }

 return(node)
}

static subtreeMutate(node1, index, depth){

  const node2 = GPnode.generateNode(depth,'full')

  return(GPnode.crossover(node1,node2,index,0))

}





  /*Auxilliary Functions */

toArray(){

    if(this.type=='function'){
      //var f=[this];

      let args=[this]

      for(var i=0;i<this.arity;i++){
        var arg=this.arguments[i]
        args=args.concat(arg.toArray())
      }
      return(args)

    }
    else {
      var list=[this]
      return(list)
    }
  }

  toStrArr(){
    let str=''
    
    if(this.type=='constant'){
      str+=this.value 
      str+=','

    }
    else if(this.type=='variable'){
      str+='"' + this.variablename + '"'
      str+=','
    }
    else if(this.type=='function'){
      str+='"'+this.functionname + '",'
      if(true){

        for(var i=0;i<this.arity;i++){
          var arg=this.arguments[i]
          str+=arg.toStrArr();

        }
      }

    }
    return(str);
  }

  printStr(depth,full){
    let str='' + this.id + " "
    for(let i=0;i<depth;i++){
      str+=' '

    }
    if(this.type=='constant'){
      str+=this.value
      str+='\n'

    }
    else if(this.type=='variable'){
      str+=this.variablename
      str+='\n'
    }
    else if(this.type=='function'){
      str+=this.functionname + '\n'
      if(full){

        for(var i=0;i<this.arity;i++){
          var arg=this.arguments[i]
          str+=arg.printStr(depth + 1,true)

        }
      }

    }
    return(str)
  }

 static inArray(token,array){

  for(var i=0;i<array.length;i++){
    if(token == array[i])return(true)
  }

  return(false)
}

//Parse a gp Node from an array of strings
static parseNode(array){
  if(!Array.isArray(array)){
    throw new Error("argument to parseNode should be an array")
  }
  else{
    GPnode._parsePos=0;
    return(GPnode.parseNode2(array));
  }
}

static parseNode2(array){
  let newNode
  let token=array[GPnode._parsePos]
  //console.log(token)
  if(typeof token !== 'undefined'){
    GPnode._parsePos++

    if(typeof token=='number'){
      newNode=new GPnode({'type':'constant','value':token}) //constant
    }
    else if(GPnode.inArray(token,variableSet)){      //variable
      newNode=new GPnode({'type':'variable','variablename':token})
    }
    else if(typeof functionSet[token] !== 'undefined') {

      const arity = functionSet[token].arity

     
      newNode=new GPnode({'type':'function','functionname':token})

      for(var i=0;i<arity;i++){
        newNode.arguments[i]=GPnode.parseNode2(array)
      }
    


    }
    else throw new Error("invalid token: '" + token + "'")

    return(newNode)
  }
  else{
    throw new Error("failed to parse invalid array expression")
  }

}

 


}

GPnode._parsePos=0;


module.exports = Object.assign({}, {GPnode})