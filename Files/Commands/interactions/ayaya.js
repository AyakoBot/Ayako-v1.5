const gifs = [
  'https://cdn.discordapp.com/attachments/760152457799401532/825768450932211732/tenor_54.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768451192127518/tenor_56.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768451582853160/tenor_55.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768454195904522/tenor_52.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768452718460959/tenor_53.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768454724124712/tenor_57.gif',
  'https://cdn.discordapp.com/attachments/760152457799401532/825768456070103040/tenor_51.gif',
];

module.exports = {
  name: 'ayaya',
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
