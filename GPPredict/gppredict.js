'use strict'

const GPnode = require('../GPNode/GPnode.js').GPnode

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf

const predictSpeed = (ruleArr, rawObservation) => {
	const stats = nconf.get('stats')
	//create a node from the rule Array
	const node = GPnode.parseNode(ruleArr)
	const preprocessedObservation = {
		"speed1":preprocess('standardise',stats,"speed1",rawObservation.speed1),
		"speed2":preprocess('standardise',stats,"speed2",rawObservation.speed2),
		"datediff":preprocess('standardise',stats,"datediff",rawObservation.datediff),
		"going1":preprocess('standardise',stats,"going1",rawObservation.going1),
		"going2":preprocess('standardise',stats,"going2",rawObservation.going2),
		"goingdiff":preprocess('standardise',stats,"goingdiff",rawObservation.goingdiff),
		"distance1":preprocess('standardise',stats,"distance1",rawObservation.distance1),
		"distance2":preprocess('standardise',stats,"distance2",rawObservation.distance2),
		"distancediff":preprocess('standardise',stats,"distancediff",rawObservation.distancediff),
		"weight1":preprocess('standardise',stats,"weight1",rawObservation.weight1),
		"weight2":preprocess('standardise',stats,"weight2",rawObservation.weight2),
		"weightdiff":preprocess('standardise',stats,"weightdiff",rawObservation.weightdiff)
	}

	console.log(preprocessedObservation)

	const val = node.eval(preprocessedObservation)

	console.log("val: " + val)

	const minFx = nconf.get("minFx")

	const maxFx = nconf.get("maxFx")

	const maxSpeedIncrease = nconf.get("maxSpeedIncrease")
	const maxSpeedDecrease = nconf.get("maxSpeedDecrease")

	const predictedProportionalChange = (val - minFx )/(maxFx - minFx)

	const predictedChange = maxSpeedDecrease + (predictedProportionalChange * (maxSpeedIncrease - maxSpeedDecrease))

	console.log(predictedProportionalChange + " " + predictedChange)

	const prediction = rawObservation.speed1 + (rawObservation.speed1 * predictedChange)

	console.log(rawObservation.speed1 + " " + prediction + "(" + rawObservation.speed2 + ")")

	return prediction


}

const reverseStandardise = (standardisedObservation, method) => {
	const stats = nconf.get('stats')
	if(method == "standardise"){
		return({
		"speed1":(standardisedObservation.speed1 * stats["speed1"].stdev) + stats["speed1"].mean,
		"speed2":(standardisedObservation.speed2 * stats["speed2"].stdev) + stats["speed2"].mean,
		"datediff":(standardisedObservation.datediff * stats["datediff"].stdev) + stats["datediff"].mean,
		"going1":(standardisedObservation.going1 * stats["going1"].stdev) + stats["going1"].mean,
		"going2":(standardisedObservation.going2 * stats["going2"].stdev) + stats["going2"].mean,
		"goingdiff":(standardisedObservation.goingdiff * stats["goingdiff"].stdev) + stats["goingdiff"].mean,
		"distance1":(standardisedObservation.distance1 * stats["distance1"].stdev) + stats["distance1"].mean,
		"distance2":(standardisedObservation.distance2 * stats["distance2"].stdev) + stats["distance2"].mean,
		"distancediff":(standardisedObservation.distancediff * stats["distancediff"].stdev) + stats["distancediff"].mean,
		"weight1":(standardisedObservation.weight1 * stats["weight1"].stdev) + stats["weight1"].mean,
		"weight2":(standardisedObservation.weight2 * stats["weight2"].stdev) + stats["weight2"].mean,
		"weightdiff":(standardisedObservation.weightdiff * stats["weightdiff"].stdev) + stats["weightdiff"].mean
	})

	}
	
	

}

//type will be 'standardise', 'normalise' or null
const preprocess = (type,stats,attribute, value) => {

  if(type == null) return(value)

  if(type == 'standardise'){
    let mu = stats[attribute].mean
    let sd = stats[attribute].stdev
    return((value - mu)/sd)
  }

  if(type == 'normalise'){
    let min = stats[attribute].min
    let max = stats[attribute].max
    return((value - min)/(max - min))
  }

}

//get max and min values of a function over a training set
const getFnMinMax = (observations,fnArray) => {
	console.log("called it " + observations.length)
	const node = GPnode.parseNode(fnArray)
	let min
  	let max
  	for(let i=0;i<observations.length;i++){
	    let obs=observations[i]
	    console.log("obs " + JSON.stringify(obs))
	    if(obs.speed1!== null && obs.speed2 !== null){
	  
	   
	     console.log("good")
	      obs.val=rule.eval(obs)

	      console.log(obs.val)

	      if(typeof min == 'undefined' && typeof max == 'undefined'){
	        min = max = obs.val
	      }
	      if(obs.val > max)max=obs.val
	      if(obs.val < min)min=obs.val
	    }
	else{
		console.log("bad")
	}

  	}
  	console.log(min + " " + max)


} 





module.exports = {predictSpeed, reverseStandardise, getFnMinMax}