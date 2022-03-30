const gifs = [
  'https://images-ext-2.discordapp.net/external/hMN0jfdNLYH_JmIltn50v_kbxbVPmg7LEycbgz7AuX8/%3Fitemid%3D15735907/https/media1.tenor.com/images/5878c0995fcf89352ff13189ee61f303/tenor.gif',
  'https://imgur.com/RPCWKtc.gif',
  'https://imgur.com/esMJKkK.gif',
  'https://images-ext-1.discordapp.net/external/QXlArNhRqGqvKQVQdmMDLzzM0bo1UnBfw502sW-rgOQ/https/cdn.weeb.sh/images/H1hige7sZ.gif',
  'https://i.imgur.com/q3A4HL2.gif',
  'https://cdn.weeb.sh/images/HJmbWxmiZ.gif',
  'https://imgur.com/v0b2A3w.gif',
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
