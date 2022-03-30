const gifs = [
  'https://imgur.com/fErFizy.gif',
  'https://imgur.com/dbZJOrz.gif',
  'https://imgur.com/dHQ1jX2.gif',
  'https://imgur.com/cpoeYct.gif',
  'https://imgur.com/xvjq23d.gif',
  'https://imgur.com/jhXUZAT.gif',
  'https://imgur.com/KnNqCMq.gif',
  'https://imgur.com/J8j02Ls.gif',
  'https://imgur.com/UOT1Pqx.gif',
  'https://imgur.com/098SPQo.gif',
  'https://imgur.com/aaPl4M8.gif',
];

module.exports = {
  name: 'peek',
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
