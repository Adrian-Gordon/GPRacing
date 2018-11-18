'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const GPnode = require('../GPNode/GPnode.js').GPnode
const gppredict = require('./gppredict')

const nconf = require('../config/conf.js').nconf

const fs = require('fs')
const readline = require('readline')


describe("reverseStandardise", () => {
	it("should reverseStandardise a standardised observation", (done) => {
		const observation = {
			"speed1":-0.00031041200231932614,
			"speed2":0.02437885017083039,
			"datediff":-0.7158328258634301,
			"going1":-0.42602886419910424,
			"going2":-0.4138668330095082,
			"goingdiff":0.015287739720767043,
			"distance1":0.8790906836051532,
			"distance2":-1.1515487235326447,
			"distancediff":-1.7549994049433228,
			"weight1":-0.001372614950813784,
			"weight2":0.28017726733626397,
			"weightdiff":0.21762485633885462,
			"type1":0,
			"type2":0,
			"typediff":0
		}

		const result = gppredict.reverseStandardise(observation, 'standardise')
		console.log(result)
		done()


	})
})

/*describe("getFnMinMax", () => {
	it("gets the min and max values of a function over a training set", (done) => {
		const observations = []

		const instream = fs.createReadStream(nconf.get('datafilepath'))

		const rl = readline.createInterface(instream)

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
		  gppredict.getFnMinMax(observations,nconf.get('rule'))
		  done()
		})

	})
})*/


describe("gppredict", () => {

	it("should predict a speed from raw data", (done) => {
		const ruleArr = nconf.get('rule')
		const observation = nconf.get('observation')
		expect(gppredict.predictSpeed(ruleArr, observation)).to.be.a('number')
		done()
	})
})