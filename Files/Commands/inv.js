const Discord = require('discord.js');

module.exports = {
  name: 'inv',
  perm: 134217728n,
  dm: false,
  takesFirstArg: true,
  aliases: [],
  type: 'info',
  description: 'Send a suggestion vote',
  usage: ['inv [mc or discord] [username]'],
  thisGuildOnly: ['692452151112368218'],
  async execute(msg) {
    const promotion = msg.args.slice(1).join(' ');
    const channel = msg.args[0];
    if (!promotion) return msg.reply("You need to tell me who's up to be invited?");
    if (channel.toLowerCase() === 'mc') {
      const SuggestEmbed = new Discord.MessageEmbed()
        .setTitle('Should this player be invited to TA Infinite MC server?')
        .setAuthor({
          name: `${msg.author.tag}`,
          iconURL: msg.author.displayAvatarURL(),
        })
        .setDescription(promotion)
        .setTimestamp()
        .setColor('#b0ff00');
      msg.react('670163913370894346').catch(() => {});
      const m = await msg.client.ch.send(msg.client.channels.cache.get('773310464700579851'), {
        embeds: [SuggestEmbed],
      });
      m.react('670163913370894346').catch(() => {});
      m.react('746392936807268474').catch(() => {});
    } else if (channel.toLowerCase() === 'discord') {
      const SuggestEmbed = new Discord.MessageEmbed()
        .setTitle('Should this player be invited to this Discord?')
        .setAuthor({
          name: `${msg.author.tag}`,
          iconURL: msg.author.displayAvatarURL(),
        })
        .setDescription(promotion)
        .setTimestamp()
        .setColor('#b0ff00');
      msg.react('670163913370894346').catch(() => {});
      const m = await msg.client.ch.send(msg.client.channels.cache.get('773310464700579851'), {
        embeds: [SuggestEmbed],
      });
      m.react('670163913370894346').catch(() => {});
      m.react('746392936807268474').catch(() => {});
    } else return msg.reply('That was not a valid channel option. -> `h!inv MC/Discord [user]`');
    return null;
  },
};
