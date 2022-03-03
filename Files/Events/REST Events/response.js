const logger = require('../../BaseClient/APILog').resLogger;

module.exports = (request, response) => {
  logger.log(`${new Date()} | Response |`, response);
};
