const logger = require('../../BaseClient/APILog').resLogger;

module.exports = (request, response) => {
  if (request) logger.log(`${new Date()} | D.js Response |`, response);
  else logger.log(`${new Date()} | Eris Response |`, response);
};
