module.exports = {
  name: 'baka',
  aliases: null,
  execute: async (msg) => {
    const gif = await getGif(msg);
    const loneError = !msg.mentions.users.size && !msg.lan.lone[module.exports.name];

    if (loneError) return { loneError };
    return { gif, loneError };
  },
};

const getGif = async (msg) =>
  (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url;
