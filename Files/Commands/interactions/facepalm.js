module.exports = {
  name: 'facepalm',
  aliases: null,
  isAsync: true,
  gif: async (msg) => (await msg.client.neko.fetchRandom(module.exports.name)).results[0].url,
};
