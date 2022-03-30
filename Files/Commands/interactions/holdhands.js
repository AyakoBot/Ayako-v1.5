const gifs = [
  'https://cdn.weeb.sh/images/Sky0l65WM.gif',
  'https://cdn.weeb.sh/images/BkiRKrLBz.gif',
  'https://cdn.weeb.sh/images/rJx5xa9bf.gif',
  'https://cdn.weeb.sh/images/BJzLMTcbf.gif',
  'https://cdn.weeb.sh/images/HJqpxp5bf.gif',
  'https://cdn.weeb.sh/images/rJ2IfTq-f.gif',
  'https://cdn.weeb.sh/images/B1rpeTqZf.gif',
  'https://cdn.weeb.sh/images/rJX0eac-z.gif',
  'https://cdn.weeb.sh/images/H1urgT5-f.gif',
  'https://cdn.weeb.sh/images/HkGuxacbf.gif',
  'https://cdn.weeb.sh/images/rJ2IfTq-f.gif',
  'https://cdn.weeb.sh/images/B1jKga5Zz.gif',
  'https://cdn.weeb.sh/images/Hk5_ga5bG.gif',
  'https://cdn.discordapp.com/attachments/298955020232032258/452638956517982208/holdhands-rk5SMpq-M.gif',
];

module.exports = {
  name: 'handhold',
  aliases: ['holdhands'],
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
