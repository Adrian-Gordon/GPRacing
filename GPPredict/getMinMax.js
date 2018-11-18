/*node getMinMax --conf=testconfig.json*/

'use strict'

const fs = require('fs')
const readline = require('readline')

const GPnode = require('../GPNode/GPnode.js').GPnode

const observations = []

const instream = fs.createReadStream("../data/0-1310-g-gs-st.js")

const rl = readline.createInterface(instream)

const nconf = require('../config/conf.js').nconf

rl.on('line', line => {
  //console.log(line)
  const observation = JSON.parse(line)
  observations.push(observation)
})

rl.on('close', line => {
  //console.log('close:' + line)
  //console.log(observations)

  //learn()
  console.log("length: " + observations.length)
  //gppredict.getFnMinMax(observations,nconf.get('rule'))
  //done()
  const arr = ["-","^","^","*","speed1",3.5129,"+","/","/",9.0331,-4.5116,"-",3.5515,3.5129,"speed1","if<=","+","weight1","goingdiff","if<=","+","weight1","if<=","+","weight1","weight1","weight1","+","weight1","if<=","+","weight1",3.5129,"weight1","/",9.0331,-4.5116,"-","^",3.5129,"if<=","+","weight1","^","^","*","speed1",3.5129,"+","/","/",9.0331,-4.5116,"-",3.5515,"+","weight1","goingdiff","speed1","if<=","+","weight1","/",9.0331,-4.5116,"goingdiff",3.5129,"goingdiff",3.5515,3.5129,"goingdiff","^",3.5129,"weight1","-","^",3.5129,"if<=","+","weight1","^","^","*","speed1","if<=","+","weight1","/",9.0331,-4.5116,"goingdiff",3.5129,"goingdiff","+","/","/",9.0331,-4.5116,"-",3.5515,"+","weight1","speed1","speed1","if<=","+","weight1","/",9.0331,-4.5116,"goingdiff",3.5129,"goingdiff","goingdiff","weight1","goingdiff","^",3.5129,"weight1","goingdiff",3.5129,"goingdiff",3.5129,"goingdiff","^",3.5129,"weight1"]
  const node = GPnode.parseNode(arr)
	let min
  	let max
  	for(let i=0;i<observations.length;i++){
	    let obs=observations[i]
	    //console.log("obs " + JSON.stringify(obs))
	    if(obs.speed1!== null && obs.speed2 !== null){
	  
	   
	     //console.log("good")
	      obs.val=node.eval(obs)

	      //console.log(obs.val)

	      if(typeof min == 'undefined' && typeof max == 'undefined'){
	        min = max = obs.val
	      }
	      if(obs.val > max)max=obs.val
	      if(obs.val < min)min=obs.val
	      if(obs.val > 39.0)console.log(JSON.stringify(obs))
	    }
	else{
		//console.log("bad")
	}

  	}
  	console.log(min + " " + max)
  })
