const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/825773975815979028/tenor_64.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773976747507822/tenor_62.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773979162640384/tenor_61.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773976374345728/tenor_63.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773981973479455/tenor_59.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773982321737768/tenor_60.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825773984963756072/tenor_58.gif',
];

module.exports = {
  name: 'woof',
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
