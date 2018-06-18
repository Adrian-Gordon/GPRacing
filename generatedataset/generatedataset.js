
'use strict'

const nconf = require('../config/conf.js').nconf
const logger = require('../logger/log.js').logger
const moment = require('moment')

const absoluteMinimumSpeed = nconf.get('absoluteMinimumSpeed')
const absoluteMaximumSpeed = nconf.get('absoluteMaximumSpeed')
const minPercentOfWinningTime = nconf.get('minpercentofwinningtime')
const minDistance = nconf.get("mindistance")
const maxDistance = nconf.get("maxdistance")
const racetypes = nconf.get('racetypes') 
const surfaces = nconf.get('surfaces')
const goings = nconf.get('goings')
const goingMappings = nconf.get('goingmappings')

const MongoClient=require('mongodb').MongoClient;

MongoClient.connect("mongodb://" + nconf.get("databaseurl"),(err,database) => {
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
                if((performance.speed >= absoluteMinimumSpeed)&&(performance.speed <= absoluteMaximumSpeed)){
                  if(goings.find((str) => str === performance.going)){
                    if(performance.percentofwinningtime >= minPercentOfWinningTime){
                      //logger.info("GOOD")
                      if(performance.distance >= minDistance && performance.distance < maxDistance)
                          performanceArray.push(performance)
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
                //logger.info("Wrong type or surface: " + performance.racetype + " " + performance.surface)
              }

            }

            //now generate the performance records

            //sort by date
            performanceArray.sort(function(a,b){

              if(a.date < b.date)return(-1)
              else if(a.date > b.date)return(1)
              return(0)

            })


            generatePerformances(performanceArray)

        }

    },
    error => {
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

             
        console.log(JSON.stringify(performanceRecord) + ",")



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






