
/* Output Statistics for a dataset
returns a JSON structure:
[
  "<attribute":{
      "min": ,
      "max": ,
      "mean": ,
      "stdev"
  
  },
  . . . 
]

where attributes are:
speed1, speed2, datediff, going1, going2, goingdiff, distance1, distance2, distancediff, weight1, weight2, weightdiff

*/
'use strict'

const nconf = require('../config/conf.js').nconf
const logger = require('../logger/logger')(module)
const moment = require('moment')

const absoluteMinimumSpeed = nconf.get('absoluteMinimumSpeed')
const absoluteMaximumSpeed = nconf.get('absoluteMaximumSpeed')
const absoluteMinimumWeight = nconf.get('absoluteMinimumWeight')
const absoluteMaximumWeight = nconf.get('absoluteMaximumWeight')
const minPercentOfWinningTime = nconf.get('minpercentofwinningtime')
const minDistance = nconf.get("mindistance")
const maxDistance = nconf.get("maxdistance")
const racetypes = nconf.get('racetypes') 
const surfaces = nconf.get('surfaces')
const goings = nconf.get('goings')
const goingMappings = nconf.get('goingmappings')
const generateset = nconf.get('generateset')
const datelimit = nconf.get('datelimit')


const MongoClient=require('mongodb').MongoClient;

let nRecords = 0

let maxIncrease = 0
let maxIncreaseSpeed1
let maxIncreaseSpeed2
let maxDecrease = 0
let maxDecreaseSpeed1
let maxDecreaseSpeed2

let dataArrays ={
  "speed1":[],
  "speed2":[],
  "datediff":[],
  "going1":[],
  "going2":[],
  "goingdiff":[],
  "distance1":[],
  "distance2":[],
  "distancediff":[],
  "weight1":[],
  "weight2":[],
  "weightdiff":[]

}

let weightsArray = new Array(400)

for(let i=0; i< 400;i++){
  weightsArray[i]=0
}

MongoClient.connect(nconf.get("databaseurl"),(err,database) => {
 //logger.info("connected");
    if(err) throw(err);

    let cursor = database.db('rpdata').collection("horses").find()
    cursor.forEach(horse => {
     // logger.info(horse._id)
        if(horse){
            let performanceArray = []
            let performances = horse.performances
            let keys = Object.keys(performances)
            let nPerformances = keys.length
            for(var x=0; x<nPerformances; x++){
              let key=keys[x];
              let performance = performances[key]
             // logger.info(JSON.stringify(performance))
              performance.raceid = key


              if(racetypes.find((str) => str === performance.racetype) && surfaces.find((str) => str === performance.surface)) {
                 if((performance.weight >= absoluteMinimumWeight)&&(performance.weight <= absoluteMaximumWeight)){
                    if((performance.speed >= absoluteMinimumSpeed)&&(performance.speed <= absoluteMaximumSpeed)){
                      if(goings.find((str) => str === performance.going)){
                        if(performance.percentofwinningtime >= minPercentOfWinningTime){
                          //logger.info("GOOD")
                          if(performance.distance >= minDistance && performance.distance < maxDistance){
                            if((generateset == 'generate') && moment(performance.date).isBefore(datelimit)){
                              performanceArray.push(performance)
                            }
                            else if((generateset =='test') && moment(performance.date).isSameOrAfter(datelimit)) {
                              performanceArray.push(performance)
                            }

                            //if(performance.weight == 150){
                            //  logger.info(JSON.stringify(horse))
                             // logger.info(JSON.stringify(performance))

                            //}
                            let index = (performance.weight - 100)
                            if(index > 399)index = 399
                            weightsArray[index]++
                          }
                            
                        }
                        else{
                         // logger.info("Wrong percent: " + performance.percentofwinningtime)
                        }

                      }
                      else{
                        //logger.info("Wrong going: " + performance.going)
                      }

                    }
                    else{
                      //logger.info("Wrong absolute speed")
                    }
                  }
                else{
                  //logger.info("Wrong absolute weight")
                  //logger.info(JSON.stringify(horse))
                  //logger.info(JSON.stringify(performance))
                }
              }
              else{
                //logger.info("Wrong type or surface: " + performance.racetype + " " + performance.surface)
              }

            }

           
            generatePerformances(performanceArray)

        }

    },
    error => {
      
      console.log(JSON.stringify(generateStats()))
      console.log("#maxIncrease: " + maxIncrease + " " + maxIncreaseSpeed1 + " " + maxIncreaseSpeed2)
      console.log("#maxDecrease: " + maxDecrease + " " + maxDecreaseSpeed1 + " " + maxDecreaseSpeed2)
    //  for(let i=0;i< 400;i++){
     //   console.log((i + 100) + " " + weightsArray[i])
    //  }
      process.exit()
    })
    

})

const generatePerformances = (parray) => {
  for(let i=0;i<(parray.length - 1);i++){
    let perf1=parray[i];
    let perf1RaceType = mapRaceType(perf1.racetype)
      for(let j=i+1;j<parray.length;j++){
        let perf2=parray[j];
        let perf2RaceType = mapRaceType(perf2.racetype)
        let moment1=moment(perf1.date);
        let moment2=moment(perf2.date);
        let diffDays = moment2.diff(moment1, 'days');
        let performanceRecord={
          raceid1: perf1.raceid,
          racedate1: perf1.date,
          racedate2: perf2.date,
          raceid2: perf2.raceid,
          speed1:perf1.speed,
          speed2:perf2.speed,
          datediff:diffDays,
          going1:goingMappings[perf1.going],
          going2:goingMappings[perf2.going],
          goingdiff:goingMappings[perf2.going] - goingMappings[perf1.going],
          distance1:perf1.distance,
          distance2:perf2.distance,
          distancediff:perf2.distance-perf1.distance,
          weight1:perf1.weight,
          weight2:perf2.weight,
          weightdiff:perf2.weight-perf1.weight,
          type1:perf1RaceType,
          type2:perf2RaceType,
          typediff:perf2RaceType-perf1RaceType
        }

        if(((perf2.speed - perf1.speed)/perf1.speed)< maxDecrease) {
            maxDecrease = (perf2.speed - perf1.speed)/perf1.speed
            maxDecreaseSpeed1= perf1.speed
            maxDecreaseSpeed2 = perf2.speed
        }
        if(((perf2.speed - perf1.speed)/perf1.speed)> maxIncrease){
            maxIncrease = (perf2.speed - perf1.speed)/perf1.speed
            maxIncreaseSpeed1= perf1.speed
            maxIncreaseSpeed2 = perf2.speed
        }

             
        dataArrays.speed1.push(performanceRecord.speed1)
        dataArrays.speed2.push(performanceRecord.speed2)
        dataArrays.datediff.push(performanceRecord.datediff)
        dataArrays.going1.push(performanceRecord.going1)
        dataArrays.going2.push(performanceRecord.going2)
        dataArrays.goingdiff.push(performanceRecord.goingdiff)
        dataArrays.distance1.push(performanceRecord.distance1)
        dataArrays.distance2.push(performanceRecord.distance2)
        dataArrays.distancediff.push(performanceRecord.distancediff)
        dataArrays.weight1.push(performanceRecord.weight1)
        dataArrays.weight2.push(performanceRecord.weight2)
        dataArrays.weightdiff.push(performanceRecord.weightdiff)
        nRecords++



          }
        }


}

const mapRaceType = (racetype) => {
  let returnType = 0
  if(racetype=='HURDLE'){
    returnType=1
  }
  else if(racetype=='CHASE'){
    returnType=2
  }

  return(returnType)
          
}

const generateStats = () => {
  let rval ={}
  rval["speed1"] = generateStatsForAttribute("speed1")
  rval["speed2"] = generateStatsForAttribute("speed2")
  rval["datediff"] = generateStatsForAttribute("datediff")
  rval["going1"] = generateStatsForAttribute("going1")
  rval["going2"] = generateStatsForAttribute("going2")
  rval["goingdiff"] = generateStatsForAttribute("goingdiff")
  rval["distance1"] = generateStatsForAttribute("distance1")
  rval["distance2"] = generateStatsForAttribute("distance2")
  rval["distancediff"] = generateStatsForAttribute("distancediff")
  rval["weight1"] = generateStatsForAttribute("weight1")
  rval["weight2"] = generateStatsForAttribute("weight2")
  rval["weightdiff"] = generateStatsForAttribute("weightdiff")


  return(rval)
}


const generateStatsForAttribute = (attribute) => {

  let rval = {
    "min": null,
    "max": null,
    "mean": null,
    "stdev": null
  }

  let total = 0
  let n = dataArrays[attribute].length
  for(let i = 0; i < n; i++){
    let val = dataArrays[attribute][i]
    if(rval.min == null){
      rval.min = val
    }
    if(rval.max == null){
      rval.max = val
    }
    if(val > rval.max)rval.max = val
    if(val < rval.min)rval.min = val

    total += val
  }

  rval.mean = total / n

  let diffMeanSquaredTotal = 0

  for(let i = 0; i < n ; i++){
    let val = dataArrays[attribute][i]
    diffMeanSquaredTotal += Math.pow(val - rval.mean,2)

  }

  let avgDiffMean = diffMeanSquaredTotal / n

  rval.stdev = Math.sqrt(avgDiffMean)

  return(rval)
}






