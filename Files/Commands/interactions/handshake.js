const gifs = [
  'https://c.tenor.com/0tgfyrFJc24AAAAd/nakanohito-genome-jikkyouchuu-the-ones-within.gif',
  'https://c.tenor.com/rvHfRNhBTEAAAAAd/polt-polt-kobold.gif',
  'https://c.tenor.com/Mr_UAoDYroQAAAAC/anime-animes-shoujo.gif',
  'https://c.tenor.com/ihFADgl0zqoAAAAC/makeout-handshake.gif',
  'https://c.tenor.com/NUK_dpuFZ9gAAAAC/inazuma-eleven-ina11.gif',
  'https://c.tenor.com/4yWFhsgqzfEAAAAC/anime-handshake.gif',
  'https://c.tenor.com/y3Xt8P99CzMAAAAC/handshake-yu-narukami.gif',
  'https://c.tenor.com/rmklzHMYy80AAAAC/nichijou-anime.gif',
];

module.exports = {
  name: 'handshake',
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
