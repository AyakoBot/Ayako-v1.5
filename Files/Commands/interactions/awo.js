const gifs = [
  'https://imgur.com/iYvxI2N.gif',
  'https://imgur.com/3aozU3F.gif',
  'https://imgur.com/o9JP0BM.gif',
];

module.exports = {
  name: 'awo',
  aliases: ['awoo'],
  execute: async (msg) => {
    const gif = await getGif(msg);
    const loneError = !msg.mentions.users.size && !msg.lan.lone[module.exports.name];

    if (loneError) return { loneError };
    return { gif, loneError };
  },
};

const getGif = async () => {
  const random = Math.floor(Math.random() * gifs.length);
  return gifs[random];
};
