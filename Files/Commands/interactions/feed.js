const getPurrAPIFetch = require('../../BaseClient/Other Client Files/purrAPIfetcher');

module.exports = {
  name: 'feed',
  aliases: null,
  execute: async (msg) => {
    const gif = await getGif(msg);
    const loneError = !msg.mentions.users.size && !msg.lan.lone[module.exports.name];

    if (loneError) return { loneError };
    return { gif, loneError };
  },
};

const getGif = async (msg) => {
  const random = Math.round(Math.random() * 1);

  if (random === 0) return (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url;
  if (random === 1) return getPurrAPIFetch(module.exports.name);

  return null;
};
