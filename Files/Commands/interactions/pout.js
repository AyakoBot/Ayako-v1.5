module.exports = {
  name: 'pout',
  aliases: ['hmph', 'hmpf'],
  isAsync: true,
  gif: async (msg) => (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url,
};
