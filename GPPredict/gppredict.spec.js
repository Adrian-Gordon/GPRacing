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




describe("gppredict", () => {

	it("should predict a speed from raw data", (done) => {
		const ruleArr = nconf.get('rule')
		const observation = nconf.get('observation')
		const url = nconf.get("datasourceurl")
		gppredict.predictSpeed(ruleArr, observation, url)
		.then(prediction => {
			expect(prediction).to.be.a('number')
			done()
		})
		
	})
})