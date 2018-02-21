'use strict';

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

	describe('POST /service with a question', () => {
		it('should return HTTP 201 and reply with a confirmation message', (done) => {
			request(service)
				.post('/service')
				.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
				.field('question', 'here is my question')
				.expect(201)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					res.body.result.should.exist;
					return done;
				});
		});

		it('should return HTTP 403 if no valid token was passed', (done) => {
			request(service)
				.post('/service')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.field('question', 'can i ask you another question?')
				.expect(403)
				.end(done);
		});
	});

	describe('GET /service/:question_id', () => {
		it('should return HTTP 200 and a reply with a valid result', (done) => {
			request(service)
				.get('/service/23')
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
				.get('/service/vienna')
				.set('X-EMCEE-SERVICE-TOKEN', 'wrongToken')
				.expect(403)
				.end(done);
		});
	});
});