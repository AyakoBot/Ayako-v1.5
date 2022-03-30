const gifs = [
  'https://c.tenor.com/a4vjO1o0hewAAAAd/puuung-puung.gif',
  'https://c.tenor.com/xlW3RF3bzo8AAAAC/banished-from-the-heros-party-red.gif',
  'https://c.tenor.com/W4Voi07VHcsAAAAC/anime-josee.gif',
];

module.exports = {
  name: 'lift',
  aliases: ['pickup'],
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
