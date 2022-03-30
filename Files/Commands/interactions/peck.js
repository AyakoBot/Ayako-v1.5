const gifs = [
  'https://cdn.discordapp.com/attachments/713915203280175115/713937394696716358/Fua_z4D1yIP.gif',
  'https://cdn.discordapp.com/attachments/713915203280175115/713937439420317767/us-yTvBGvqg.gif',
  'https://cdn.discordapp.com/attachments/713915203280175115/713937422504820837/nmLPCf5QtoJ.gif',
  'https://cdn.discordapp.com/attachments/713915203280175115/713937418394271784/CezoGn-h5wp.gif',
  'https://imgur.com/kXWbcEM.gif',
  'https://imgur.com/IKHwUt6.gif',
  'https://imgur.com/iW9gTWM.gif',
  'https://imgur.com/5b3nnby.gif',
  'https://imgur.com/Li0b69n.gif',
];

module.exports = {
  name: 'nom',
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
