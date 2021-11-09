const logger = require('../BaseClient/APILog').reqLogger;

module.exports = {
	execute(request) {
		logger.log(`${new Date} | Request |`, request);
	}
};