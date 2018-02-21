'use strict';

const express = require('express');
const service = express();
const bodyParser = require('body-parser');

module.exports = (config) => {
	const log = config.log();
	const router = express.Router();
	const knex = require('knex')({
		client: 'mysql',
		connection: {
			host : config.databaseInfo.url,
			user : config.databaseInfo.user,
			password : config.databaseInfo.password,
			database : config.databaseInfo.db
		}
	});

	service.use(bodyParser.json());
	service.use(bodyParser.urlencoded({extended: true}));

	router.param('question_id', (req, res, next, qid) => {
		// knex get question id
		// const questionId = ;
		const question = knex('questions').where('id', qid);
		log.info(`question id is: ${qid}`);
		req.question = question;
		next();
	});

	router.route('/service')
		.all((req, res, next) => {
			if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
				return res.sendStatus(403);
			}
			next();
		})
		.get((req, res) => {
			// get all questions if no question_id param
			// do db stuff here
			// question can be found in req.params.question
			const questions = knex.select().from('questions').timeout(1000);
			res.sendStatus(200);
			return res.json({questions});
		})
		.post((req, res) => {
			log.info(`typeof body: ${typeof req.body}`);
			log.info(`body: ${req.body}`);
			res.status(201);
			return res.json({message: 'congratulations!'});
		})
		.put((req, res) => {
			res.sendStatus(501);
		})
		.delete((req, res) => {
			res.sendStatus(501);
		});

	service.use('/service', router);
	return service;
};