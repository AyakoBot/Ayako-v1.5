const gifs = [
  'https://c.tenor.com/zpqP_RbvWQEAAAAd/couples-sweet.gif',
  'https://c.tenor.com/QGrKnjDkhjMAAAAC/bath-tub.gif',
  'https://c.tenor.com/bgPDDNuCXE8AAAAC/bath-tub.gif',
  'https://c.tenor.com/13C980rvvOAAAAAC/bathing-anime.gif',
  'https://c.tenor.com/De2M2efiEYUAAAAC/kono-suba-chomusuke.gif',
  'https://c.tenor.com/99ThCiFu8YEAAAAC/anime-kawaii.gif',
  'https://c.tenor.com/ACcFJyql1VoAAAAC/hayasaka-ai-kaguya-sama.gif',
  'https://c.tenor.com/WKPCniX30KMAAAAd/funami-yui-anime.gif',
];

module.exports = {
  name: 'bath',
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
