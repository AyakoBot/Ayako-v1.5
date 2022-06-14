module.exports = {
  name: 'xban',
  category: 'Moderation',
  dm: false,
  takesFirstArg: true,
  aliases: null,
  thisGuildOnly: ['298954459172700181', '366219406776336385'],
  perm: 4n,
  description: 'Ban a User from Animekos and Gameverse at the same time',
  usage: ['xban [user ID or mention] (reason)'],
  type: 'mod',
  async execute(msg) {
    const user = msg.args[0].replace(/\D+/g, '');
    if (!user) return msg.client.ch.reply(msg, "Couldn't find that User");

    const Gameverse = msg.client.guilds.cache.get('366219406776336385');
    const Animekos = msg.client.guilds.cache.get('298954459172700181');
    const banReason = msg.args[1] ? msg.args.slice(1).join(' ') : 'No Reason given';

    Gameverse.bans.create(user, { reason: banReason }).catch(() => {});
    Animekos.bans.create(user, { reason: banReason }).catch(() => {});
    msg.react('✅');
    return null;
  },
};
