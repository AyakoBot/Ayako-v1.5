const gifs = [
  'https://cdn.discordapp.com/attachments/726252103302905907/736289436987555950/tenor_-_2020-07-24T203041.175.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289443014770789/tenor_-_2020-07-24T203032.745.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289447116537936/tenor_-_2020-07-24T203049.272.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289454842445944/tenor_-_2020-07-24T203046.597.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289455844884510/tenor_-_2020-07-24T203052.337.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289456545333289/tenor_-_2020-07-24T203043.765.gif',
  'https://cdn.discordapp.com/attachments/726252103302905907/736289456990060624/tenor_-_2020-07-24T203058.934.gif',
  'https://c.tenor.com/vepufc4d-0QAAAAC/boobs-bonk.gif',
  'https://c.tenor.com/C54Ci_zhn-AAAAAC/bang-dream-bandori.gif',
  'https://c.tenor.com/E6njrpISBV4AAAAC/bonk-hit.gif',
  'https://c.tenor.com/N3ZdP-hTVHYAAAAC/anime-anime-bonk.gif',
  'https://c.tenor.com/d1slOLImNHYAAAAC/anime-couple.gif',
  'https://c.tenor.com/FJsjk_9b_XgAAAAC/anime-hit.gif',
  'https://c.tenor.com/tf2de2mbRgwAAAAC/touka-kirishima-tokyo-ghoul.gif',
  'https://c.tenor.com/JS0ZB_b3kjoAAAAC/sugiura-ayano-funami-yui.gif',
  'https://c.tenor.com/EiFGi9dZXSAAAAAC/toradora-taiga.gif',
  'https://c.tenor.com/mXwNLMSQRN8AAAAC/yuru-yuri-chinatsu-yoshikawa.gif',
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
