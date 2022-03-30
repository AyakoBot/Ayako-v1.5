const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/825788696631574608/tenor_74.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788700628746240/tenor_65.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788699462991912/tenor_69.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788700562554900/tenor_73.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788700834660352/tenor_68.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788702323376158/tenor_67.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788713640001595/tenor_71.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788705046396948/tenor_66.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825788702071455744/tenor_70.gif',
];

module.exports = {
  name: 'nya',
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
