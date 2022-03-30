const gifs = [
  'https://imgur.com/r7PSg14.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845812664844288/jenko-jenki.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845813155581972/nanatsu-no-taizai-seven-deadly-sins.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845813482729532/yami-throw-asta-yami-throw.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845814132858941/yeet-anime.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845814460006420/yeet-anime_1.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/958845815235969094/yeet.gif',
];

module.exports = {
  name: 'yeet',
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
