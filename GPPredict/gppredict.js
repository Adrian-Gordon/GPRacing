'use strict'

const GPnode = require('../GPNode/GPnode.js').GPnode

const logger = require('../logger/logger')(module)

const nconf = require('../config/conf.js').nconf

const request = require('request-promise-native')

const predictSpeed = (ruleArr, rawObservation, dataServerUrl) => {
	const node = GPnode.parseNode(ruleArr)
	const url = nconf.get("datasourceurl")+"/standardise"

	return new Promise((resolve, reject) => {
		request({
			method:'POST',
			uri:url,
			json:true,
			body:rawObservation
		})
		.then(standardised => {
			resolve(standardised)
			console.log(JSON.stringify(standardised))
		})
		.catch(e => {
			reject(e)
		})

	})
	 


}





module.exports = {predictSpeed}