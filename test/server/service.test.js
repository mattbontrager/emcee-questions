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
	describe('POST a question to /service', () => {
		it('should return HTTP 201', (done) => {
			request(service)
				.post('/service')
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
				.post('/service')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.send({
					question: 'a random question inserted while testing',
					asker_id: 999,
					asker_name: 'Robo Test User'
				})
				.expect(403)
				.end(done);
		});
	});
});