const logger = require('../../BaseClient/APILog').reqLogger;

module.exports = (request) => {
  logger.log(`${new Date()} | Request |`, request);
};
