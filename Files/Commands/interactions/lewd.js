const gifs = [
  'https://imgur.com/64doxzq.gif',
  'https://imgur.com/uLXVak6.gif',
  'https://imgur.com/FEJerlj.gif',
  'https://imgur.com/6LKIAVc.gif',
  'https://imgur.com/teQWzRf.gif',
  'https://imgur.com/2flX6wz.gif',
  'https://imgur.com/Kre5oOh.gif',
  'https://imgur.com/QHLsg60.gif',
  'https://imgur.com/SxR4r7v.gif',
  'https://imgur.com/bLco6I7.gif',
  'https://imgur.com/UEEcrxj.gif',
  'https://imgur.com/jmTA7RT.gif',
];

module.exports = {
  name: 'lewd',
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
