const logger = require('../BaseClient/APILog').resLogger;

module.exports = {
  execute(request, response) {
    logger.log(`${new Date()} | Response |`, response);
  },
};
