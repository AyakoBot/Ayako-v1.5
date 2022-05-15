module.exports = {
  name: 'laugh',
  aliases: ['kek'],
  isAsync: true,
  gif: async (msg) => (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url,
};
