const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/776095817290612756/tenor_29.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095821212680210/tenor_28.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095822768242778/tenor_26.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095828065779722/tenor_23.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095828220706816/tenor_22.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095832200970250/tenor_25.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095836420571186/tenor_24.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/776095821199704114/tenor_27.gif',
];

module.exports = {
  name: 'shake',
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
