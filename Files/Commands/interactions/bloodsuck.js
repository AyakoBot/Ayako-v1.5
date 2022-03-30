const gifs = [
  'https://i.imgur.com/UbaeYIq.gif',
  'https://i.imgur.com/DAuEJ2F.gif',
  'https://i.imgur.com/CtwmzpG.gif',
  'https://i.imgur.com/qi83Eft.gif',
];

module.exports = {
  name: 'bloodsuck',
  aliases: null,
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
