'use strict';
const config = require('../config');
const log = config.log();
const request = require('superagent');
const service = require('../server/service')(config);
const http = require('http');
const responses = require('../server/responses');
const quote = responses.process();
const server = http.createServer(service);
server.listen();

server.on('listening', function() {
	log.info(`EMCEE-Questions is listening on ${server.address().port} in ${service.get('env')} mode.`);
	log.info(`Here's a random quote for you: ${quote}`);

	const announce = () => {
		request.put(`http://127.0.0.1:4001/service/questions/${server.address().port}`)
			.set('X-EMCEE-SERVICE-TOKEN', config.serviceAccessToken)
			.set('X-EMCEE-API-TOKEN', config.emceeApiToken)
			.end((err) => {
				if (err) {
					log.debug(err);
					log.info('Error connecting to Emcee');
				}
			});
	};
	announce();
	setInterval(announce, 15 * 1000);
});