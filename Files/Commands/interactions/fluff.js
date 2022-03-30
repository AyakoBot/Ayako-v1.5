const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'fluff',
  aliases: null,
  execute: async (msg) => {
    const gif = await getGif(msg);
    const loneError = !msg.mentions.users.size && !msg.lan.lone[module.exports.name];

    if (loneError) return { loneError };
    return { gif, loneError };
  },
};

const getGif = async () => getPurrAPIFetch(module.exports.name);
