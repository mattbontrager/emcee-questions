'use strict';

require('dotenv').config();

const bunyan = require('bunyan');
const serviceAccessToken = require('crypto').randomBytes(16).toString('hex').slice(0, 32);

const log = {
	development: () => {
		return bunyan.createLogger({name: 'EMCEE-QUESTION-development', level: 'debug'});
	},
	production: () => {
		return bunyan.createLogger({name: 'EMCEE-QUESTION-production', level: 'info'});
	},
	test: () => {
		return bunyan.createLogger({name: 'EMCEE-QUESTION-test', level: 'debug'});
	}
};

const config = {
	emceeApiToken: process.env.EMCEE_API_TOKEN,
	serviceAccessToken: serviceAccessToken,
	speakerId: process.env.SPEAKER_ID,
	log: (env) => {
		if (env) {
			return log[env]();
		}
		return log[process.env.NODE_ENV || 'development']();
	},
	db: {
		url: process.env.DB_URL,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		db: process.env.DB_DATABASE
	}
};

module.exports = config;