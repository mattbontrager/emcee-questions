'use strict';

const express = require('express');
const service = express();
const bodyParser = require('body-parser');
const responses = require('./responses');

module.exports = (config) => {
	service.use(bodyParser.json());
	service.use(bodyParser.urlencoded({extended: true}));

	const knex = require('knex')({
		client: 'mysql',
		connection: {
			host : config.db.url,
			user : config.db.user,
			password : config.db.password,
			database : config.db.db
		}
	});

	const log = config.log();

	service.post('/service', (req, res) => {
		if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
			return res.sendStatus(403);
		}
		if (!req.body.question) {
			return res.sendStatus(418);
		}

		knex('questions').insert({
			question: req.body.question,
			asker_id: req.body.asker_id,
			question_channel: req.body.question_channel
		}).then(ret => {
			log.info(`ret: ${ret}`);
			var successResponse = responses.process();
			res.status(201);
			res.json({result: successResponse});
		}, err => {
			log.error(`insert error: ${err}`);
			res.sendStatus(500);
		});
	});

	service.get('/service', (req, res) => {
		if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
			return res.sendStatus(403);
		}
		return res.sendStatus(501);
	});

	service.put('/service', (req, res) => {
		if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
			return res.sendStatus(403);
		}
		return res.sendStatus(501);
	});

	service.delete('/service', (req, res) => {
		if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
			return res.sendStatus(403);
		}
		return res.sendStatus(501);
	});

	return service;
};


/**
 * TODO: evaluate the risk in implementing a perfect chronolocation model in the MySQL database.
 * https://dev.mysql.com/doc/refman/5.7/en/spatial-types.html
 */