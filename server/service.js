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

	const getQuestion = (questionid) => {
		return knex.select()
			.from('questions')
			.where({'id': questionid})
			// .pluck('question')
			.then(question => {
				return question;
			})
			.catch(err => {
				log.error('something went wrong getting the question: ', err);
				return err;
			});
	};

	const getAllQuestions = () => {
		return knex.select().from('questions').then(questions => {
			return questions;
		}).catch(err => {
			log.error('something went wrong getting all questions: ', err);
			return err;
		});
	};

	service.use(bodyParser.json());
	service.use(bodyParser.urlencoded({extended: true}));

	router.param('question_id', (req, res, next, qid) => {
		log.info(`question id is: ${qid}`);
		getQuestion(qid).then(question => {
			req.question = question;
			next();
		}, err => {
			throw new Error(err);
		});
	});

	router.route('/:question_id')
		.all((req, res, next) => {
			if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
				return res.sendStatus(403);
			}
			next();
		})
		.get((req, res) => {
			log.info(`question response from db is: ${req.question}`);
			res.status(200);
			return res.json({result: req.question});
		});

	router.route('/')
		.all((req, res, next) => {
			if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
				return res.sendStatus(403);
			}
			next();
		})
		.get((req, res) => {
			getAllQuestions().then(questions => {
				res.status(200);
				return res.json(questions);
			}, err => {
				res.status(500);
				throw new Error(err);
			});
		})
		.post((req, res) => {
			if (!req.body.question) {
				return res.sendStatus(418);
			}

			knex('questions').insert({
				question: req.body.question,
				asker_id: req.body.asker_id,
				question_channel: req.body.question_channel
			}).then(ret => {
				log.info(`ret: ${ret}`);
				res.status(201);
				return res.json({result: 'congratulations!'});
			}, err => {
				log.error(`insert error: ${err}`);
				return res.sendStatus(500);
			});
		})
		.put((req, res) => {
			return res.sendStatus(501);
		})
		.delete((req, res) => {
			return res.sendStatus(501);
		});

	service.use('/service', router);
	return service;
};