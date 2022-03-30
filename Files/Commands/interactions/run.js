const gifs = [
  'https://c.tenor.com/q80PMcmrxDwAAAAd/anime-girl.gif',
  'https://c.tenor.com/W_0ux9exhhwAAAAC/machikado-mazoku-running-away.gif',
  'https://c.tenor.com/-VmxvlLeivoAAAAC/yashiro-nene-jibaku-shounen-hanako-kun.gif',
  'https://c.tenor.com/zD2iXGCoujkAAAAC/ganbaruby-run.gif',
  'https://c.tenor.com/Zgg2MkMiYcsAAAAC/fruits-basket-fruba.gif',
  'https://c.tenor.com/G2YT33dvNjQAAAAC/anime.gif',
  'https://c.tenor.com/Xyl5bNpBCVsAAAAd/sumi-cute.gif',
  'https://c.tenor.com/E92g-rwBrvkAAAAC/anime-runaway.gif',
  'https://c.tenor.com/x91zb9XYaiQAAAAd/anime-girl.gif',
  'https://c.tenor.com/Vuu21qfS4wcAAAAC/maki-natsuo-love-lab.gif',
  'https://c.tenor.com/mUIXigPWPuYAAAAd/anime-anime-girl-running.gif',
  'https://c.tenor.com/MMA6_WvqS60AAAAC/escape-im-out.gif',
];

module.exports = {
  name: 'run',
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
