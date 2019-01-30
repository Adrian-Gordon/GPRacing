
'use strict'

const nconf = require('../config/conf.js').nconf
const logger = require('../logger/logger')(module)
const moment = require('moment')
const request = require('sync-request')

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
const output = nconf.get('output') //will be null, "json" or "csv"

const preprocesstype = nconf.get('preprocesstype') //will be null, 'standardise' or 'normalise'
const stats = nconf.get('stats')

const MongoClient=require('mongodb').MongoClient;

let nRecords = 0
console.log(nconf.get("databaseurl"))
MongoClient.connect(nconf.get("databaseurl"),(err,database) => {
 //logger.info("connected");
    if(err) throw(err);

    let cursor = database.db('rpdata').collection("horses").find()

    let horsesCount = 0
    let modeSum = 0
    //console.log("const dataset = [")
    cursor.forEach(horse => {
     // logger.info(horse._id)
        if(horse){
            let performanceArray = []
            let performances = horse.performances
            let keys = Object.keys(performances)
            let nPerformances = keys.length
            //console.log(nPerformances)
            for(var x=0; x<nPerformances; x++){
              let key=keys[x];
              let performance = performances[key]
             // logger.info(JSON.stringify(performance))
              performance.raceid = key
              performance.horseid = horse._id


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
                  }
              }
              else{
                //logger.info("Wrong type or surface: " + performance.racetype + " " + performance.surface)
              }

            }

            //console.log("l: " + performanceArray.length)
            //now generate the performance records
            //console.log(performanceArray)
            //sort by date
            performanceArray.sort(function(a,b){

              if(a.date < b.date)return(-1)
              else if(a.date > b.date)return(1)
              return(0)

            })

            if(performanceArray.length > 5){
              
              horsesCount++
              const performanceRecords = generatePerformances(performanceArray)
              //console.log(JSON.stringify(performanceRecords))
              const res =request('POST',"http://localhost:3002/predict",
                {json: performanceRecords})
              
              const predictions = JSON.parse(res.getBody('utf8'))
              //console.log(JSON.stringify(predictions))

              const res2 = request('POST',"http://localhost:3002/getmode",
                {json: predictions})
              
              try{
                const mode = JSON.parse(res2.getBody('utf8'))
              
                modeSum += mode
                console.log("mode: " + mode + " average: "  + (modeSum / horsesCount))
              }catch(Exception){
                console.log(Exception)
                console.log(res2.getBody('utf8'))
                console.log(JSON.stringify(predictions))
              }
             
              
              //process.exit()
          }

        }

    },
    error => {
      
      if(!output)console.log(nRecords)
      //console.log(']')
      //console.log("module.exports = {dataset}")
      process.exit()
    })
    

})

/*predict performance for today, 1600m, Good, 128 lbs*/
const generatePerformances = (parray) => {
  //console.log(JSON.stringify(parray))
  let performanceRecords = []
  for(let i=0;i< parray.length;i++){
    let perf1=parray[i];
    let perf1RaceType = mapRaceType(perf1.racetype)
    let moment1=moment(perf1.date);
    let moment2=moment(new Date());
    let diffDays = moment2.diff(moment1, 'days');
    let performanceRecord={
          speed1:[perf1.speed],
          datediff:[diffDays],
          going1:[goingMappings[perf1.going]],
          going2:[goingMappings["Good"]],
          distance1:[perf1.distance],
          distance2:[1600],
          weight1:[perf1.weight],
          weight2:[128],
          speed2:[11.0]
      }
    performanceRecords.push(performanceRecord)
  }

  return(performanceRecords)


}


const generatePerformances_old = (parray) => {
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
          horseid: perf1.horseid,
          raceid1: perf1.raceid,
          racedate1: perf1.date,
          racedate2: perf2.date,
          raceid2: perf2.raceid,
          speed1:preprocess(preprocesstype,stats,'speed1',perf1.speed),
          speed2:preprocess(preprocesstype,stats,'speed2',perf2.speed),
          datediff:preprocess(preprocesstype,stats,'datediff',diffDays),
          going1:preprocess(preprocesstype,stats,'going1',goingMappings[perf1.going]),
          going2:preprocess(preprocesstype,stats,'going2',goingMappings[perf2.going]),
          goingdiff:preprocess(preprocesstype,stats,'goingdiff',goingMappings[perf2.going] - goingMappings[perf1.going]),
          distance1:preprocess(preprocesstype,stats,'distance1',perf1.distance),
          distance2:preprocess(preprocesstype,stats,'distance2',perf2.distance),
          distancediff:preprocess(preprocesstype,stats,'distancediff',perf2.distance-perf1.distance),
          weight1:preprocess(preprocesstype,stats,'weight1',perf1.weight),
          weight2:preprocess(preprocesstype,stats,'weight2',perf2.weight),
          weightdiff:preprocess(preprocesstype,stats,'weightdiff',perf2.weight-perf1.weight),
          weightxdistance1:preprocess(preprocesstype, stats,'weightxdistance1',perf1.weight * perf1.distance),
          weightxdistance2:preprocess(preprocesstype, stats,'weightxdistance1',perf2.weight * perf2.distance),
          weightxdistancediff:preprocess(preprocesstype, stats,'weightxdistancediff',(perf2.weight * perf2.distance)-(perf1.weight * perf1.distance)),
          type1:perf1RaceType,
          type2:perf2RaceType,
          typediff:perf2RaceType-perf1RaceType
        }

        // console.log(JSON.stringify(perf1))    
        if(output=="json")console.log(JSON.stringify(performanceRecord) )//+ ",")
        else if(output=="csv"){
          //console.log(JSON.stringify(performanceRecord) )
          console.log(performanceRecord.horseid + "," + performanceRecord.raceid1 + "," + performanceRecord.speed1 + "," + performanceRecord.speed2 + "," + performanceRecord.datediff +"," +performanceRecord.goingdiff + "," + performanceRecord.distancediff + "," + performanceRecord.weight1 + "," + performanceRecord.weight2 + "," + performanceRecord.weightdiff +"," + performanceRecord.weightxdistancediff)
        }
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







