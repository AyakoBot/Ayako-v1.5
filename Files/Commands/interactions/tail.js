const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'tail',
  aliases: ['wag', 'tailwag'],
  isAsync: true,
  gif: () => getPurrAPIFetch(module.exports.name),
};
