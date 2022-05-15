const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'comfy',
  aliases: ['comf'],
  isAsync: true,
  gif: async () => getPurrAPIFetch(module.exports.name),
};
