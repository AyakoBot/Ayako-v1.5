const Builders = require('@discordjs/builders');

module.exports = {
  name: 'promotion',
  dm: false,
  takesFirstArg: true,
  aliases: null,
  thisGuildOnly: ['692452151112368218'],
  perm: 4n,
  type: 'utility',
  execute: async (msg) => {
    const promotion = msg.args.slice(1).join(' ');
    let channel;

    if (!promotion) {
      msg.client.ch.error(msg, "You need to tell me who's up for a promotion");
      return;
    }

    if (msg.args[0].toLowerCase() === 'net') {
      if (!msg.member.roles.cache.has('746460014625030207')) {
        msg.client.ch.error(msg, 'ur dum');
        return;
      }
      channel = msg.client.channels.cache.get('746668871611842621');
    } else if (msg.args[0].toLowerCase() === 'gold') {
      channel = msg.client.channels.cache.get('747820337361846354');
    } else {
      msg.client.ch.error(
        msg,
        'That is not a valid option. Options avaliable -> `gold` for Gold voting, `net` for Netherite Voting',
      );
      return;
    }

    msg.client.ch.reply(msg, { content: '<:Tick:902269933860290650>' });

    const SuggestEmbed = new Builders.UnsafeEmbedBuilder()
      .setTitle('Should this player be promoted?')
      .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(promotion)
      .setTimestamp()
      .setColor(msg.client.constants.standard.color);

    msg.client.ch.send(channel, { embeds: [SuggestEmbed] }).then((m) => {
      m.react('902269933860290650');
      m.react('902269073805701211');
    });
  },
};
