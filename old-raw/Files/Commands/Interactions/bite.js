const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'bite',
  aliases: null,
  isAsync: true,
  gif: async (msg) => {
    const random = Math.round(Math.random() * 1);
    if (random === 0) {
      return (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url;
    }
    return getPurrAPIFetch(module.exports.name);
  },
};
