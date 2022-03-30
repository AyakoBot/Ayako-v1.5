const gifs = [
  'https://cdn.discordapp.com/attachments/726252103302905907/736289436987555950/tenor_-_2020-07-24T203041.175.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289443014770789/tenor_-_2020-07-24T203032.745.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289447116537936/tenor_-_2020-07-24T203049.272.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289454842445944/tenor_-_2020-07-24T203046.597.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289455844884510/tenor_-_2020-07-24T203052.337.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289456545333289/tenor_-_2020-07-24T203043.765.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289456990060624/tenor_-_2020-07-24T203058.934.gif',
];

module.exports = {
  name: 'bonk',
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
