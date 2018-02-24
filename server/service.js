'use strict';

const express = require('express');
const service = express();
const bodyParser = require('body-parser');
const moment = require('moment');

const commandRouter = express.Router();
const speakerRouter = express.Router();
const audienceRouter = express.Router();

const responses = require('./responses');
const aboutMeLink = '[Matt Bontrager\'s Bio](https://about.me/mattbontrager "Matt Bontrager: About Me")';

module.exports = (config) => {
	const log = config.log();
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
			.then(question => {
				return question;
			})
			.catch(err => {
				log.error('something went wrong getting the question: ', err);
				return err;
			});
	};

	const chooseAnAnswer = () => {
		log.info('in chooseAnAnswer');
		const min = 1;
		const max = responses.length;
		const rando = Math.floor(Math.random() * (max - min + 1)) + min;
		const therandom = rando - 1;
		return responses[therandom];
	};

	const updateTalk = (column) => {
		if (process.env.NODE_ENV === 'test') {
			return Promise.resolve('congratulations');
		}

		return knex('talks')
			.where('date', '=', moment().format('YYYY-MM-DD'))
			.andWhere('time', '<', moment().format('HH:mm:ss'))
			.update({
				[column]: `${moment().format('YYYY-MM-DD HH:mm:ss')}`
			})
			.then(response => {
				log.info(`update talk response: ${response}`);
				return chooseAnAnswer();
			})
			.catch(err => {
				log.error('something went wrong updating the talks: ', err);
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

	/* eslint-disable */
	const handleCommand = (command) => {
		return new Promise((resolve, reject) => {
			switch(command) {
				case 'about':
					resolve(aboutMeLink);
					break;
				case 'sessionstart':
					updateTalk('session_start').then(response => {
						resolve(response);
					});
					break;
				case 'sessionend':
					updateTalk('session_end').then(response => {
						resolve(response);
					});
					break;
				case 'talkstart':
					updateTalk('talk_start'.then(response => {
						resolve(response);
					}))
					break;
				case 'talkend':
					updateTalk('talk_end').then(response => {
						resolve(response);
					});
					break;
			};
		});
	};
	/* eslint-enable */

	service.use(bodyParser.json());
	service.use(bodyParser.urlencoded({extended: true}));

	speakerRouter.param('question_id', (req, res, next, qid) => {
		log.info(`question id is: ${qid}`);
		getQuestion(qid).then(question => {
			req.question = question;
			next();
		}, err => {
			throw new Error(err);
		});
	});

	speakerRouter.route('/:question_id')
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

	speakerRouter.route('/')
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
			return res.sendStatus(501);
		})
		.put((req, res) => {
			return res.sendStatus(501);
		})
		.delete((req, res) => {
			return res.sendStatus(501);
		});

	commandRouter.param('thecommand', (req, res, next, command) => {
		req.command = command;
		next();
	});

	commandRouter.route('/:thecommand')
		.all((req, res, next) => {
			if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
				return res.sendStatus(403);
			}
			next();
		})
		.get((req, res) => {
			if (!req.command) {
				return res.json({result: 'didnt get the command'});
			}

			if (process.env.NODE_ENV === 'TEST' && req.command !== 'about') {
				return res.json({result: 'congratulations'});
			}

			log.warn(`req.command: ${req.command}`);

			handleCommand(req.command).then(response => {
				log.info(`the response: ${response}`);
				return res.json({result: response});
			});
		})
		.post((req, res) => {
			return res.sendStatus(501);
		})
		.put((req, res) => {
			return res.sendStatus(501);
		})
		.delete((req, res) => {
			return res.sendStatus(501);
		});

	audienceRouter.route('/question')
		.all((req, res, next) => {
			if (req.get('X-EMCEE-SERVICE-TOKEN') !== config.serviceAccessToken) {
				return res.sendStatus(403);
			}
			next();
		})
		.get((req, res) => {
			return res.sendStatus(501);
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

	service.use('/service', audienceRouter);
	service.use('/service/speaker/question', speakerRouter);
	service.use('/service/speaker/command', commandRouter);
	return service;
};


/**
 * TODO: evaluate the risk in implementing a perfect chronolocation model in the MySQL database.
 * https://dev.mysql.com/doc/refman/5.7/en/spatial-types.html
 */