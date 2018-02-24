'use strict';

process.env.NODE_ENV = 'test';

require('should');

const request = require('supertest');
const config = require('../../config');
const service = require('../../server/service')(config);

describe('The express service', () => {
	describe('GET /foo', () => {
		it('should return HTTP 404', (done) => {
			request(service)
				.get('/foo')
				.expect(404, done);
		});
	});

	// audience posting question
	describe('POST /service/question with a question', () => {
		it('should return HTTP 201', (done) => {
			request(service)
				.post('/service/question')
				.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
				.send({
					question: 'a random question inserted while testing',
					asker_id: 999,
					asker_name: 'Robo Test User'
				})
				.expect(201)
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					res.body.result.should.exist;
					return done();
				});
		});

		it('should return HTTP 403 if no valid token was passed', (done) => {
			request(service)
				.post('/service/question')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.field('question', 'can i ask you another question?')
				.expect(403)
				.end(done);
		});
	});

	// speaker question
	describe('GET /service/speaker/question/:question_id', () => {
		it('should return HTTP 200 and a reply with a valid result', (done) => {
			request(service)
				.get('/service/speaker/question/2')
				.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
				.expect(200)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					res.body.result.should.exist;
					return done();
				});
		});

		it('should return HTTP 403 if no valid token was passed', (done) => {
			request(service)
				.get('/service/speaker/question/2')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.expect(403)
				.end(done);
		});
	});

	// speaker command
	describe('GET /service/speaker/command/:thecommand', () => {
		// about me command
		it('should return HTTP 200 and a reply with a valid result', (done) => {
			request(service)
				.get('/service/speaker/command/about')
				.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
				.expect(200)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					res.body.result.should.exist;
					return done();
				});
		});

		// session start
		it('should return HTTP 200 and a reply with a valid result', (done) => {
			request(service)
				.get('/service/speaker/command/sessionstart')
				.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
				.expect(200)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					res.body.result.should.exist;
					return done();
				});
		});

		it('should return HTTP 403 if no valid token was passed', (done) => {
			request(service)
				.get('/service/speaker/command/about')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.expect(403)
				.end(done);
		});
	});
});