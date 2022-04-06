const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'fluff',
  aliases: null,
  isAsync: true,
  gif: () => getPurrAPIFetch(module.exports.name),
};
