const gifs = [
  'https://cdn.weeb.sh/images/ryGpGsnAZ.gif',
  'https://cdn.weeb.sh/images/H1zlgRuvZ.gif',
  'https://cdn.weeb.sh/images/Bkxge0uPW.gif',
  'https://cdn.weeb.sh/images/rktygCOD-.gif',
  'https://cdn.weeb.sh/images/rykRHmB6W.gif',
  'https://cdn.weeb.sh/images/Syg8gx0OP-.gif',
  'https://cdn.weeb.sh/images/rJ6hrQr6-.gif',
  'https://cdn.weeb.sh/images/HkEqiExdf.gif',
  'https://cdn.weeb.sh/images/Sk15iVlOf.gif',
  'https://cdn.weeb.sh/images/Bkagl0uvb.gif',
  'https://cdn.weeb.sh/images/H13HS7S6-.gif',
  'https://cdn.weeb.sh/images/H1EJxR_vZ.gif',
  'https://cdn.weeb.sh/images/BkvTBQHaZ.gif',
  'https://cdn.weeb.sh/images/S1Ill0_vW.gif',
  'https://cdn.weeb.sh/images/Hkknfs2Ab.gif',
  'https://cdn.weeb.sh/images/HJRRyAuP-.gif',
  'https://media1.tenor.com/images/f46762ad38fbfed9e4e46bf7b89497c2/tenor.gif?itemid=12141724',
  'https://cdn.discordapp.com/attachments/713915066441007164/713935822357004298/3bAmUYhTwlu.gif',
  'https://cdn.discordapp.com/attachments/713915066441007164/713935931161182238/TKJr1PzQa7c.gif',
  'https://cdn.discordapp.com/attachments/713915066441007164/713935890958778480/evepz90Vwp2.gif',
];

module.exports = {
  name: 'lick',
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
