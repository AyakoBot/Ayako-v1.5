const gifs = [
  'https://c.tenor.com/6oV95jWO_6gAAAAC/loli-steals-loli.gif',
  'https://c.tenor.com/0Wzg7M2v_bwAAAAC/closet-kidnapping.gif',
  'https://c.tenor.com/mabGQZaavQsAAAAC/cross-ange-kidnap.gif',
  'https://c.tenor.com/PtHyjUzSV4IAAAAC/shugo-chara-kidnap.gif',
  'https://c.tenor.com/tsU1bkxP40sAAAAC/bento-knock-out.gif',
];

module.exports = {
  name: 'kidnap',
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
