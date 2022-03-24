const Builders = require('@discordjs/builders');

module.exports = {
  name: 'afk',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: null,
  type: 'info',
  async execute(msg) {
    const { lan } = msg;
    const text = msg.args.slice(0).join(' ');
    if (
      text.toLowerCase().includes('http://') ||
      text.toLowerCase().includes('https://') ||
      text.toLowerCase().includes('discord.gg')
    ) {
      return msg.client.ch.reply(msg, lan.noLinks);
    }
    const res = await msg.client.ch.query('SELECT * FROM afk WHERE userid = $1 AND guildid = $2;', [
      msg.author.id,
      msg.guild.id,
    ]);

    const embed = new Builders.UnsafeEmbedBuilder().setColor(msg.client.constants.commands.afk);

    if (res && res.rowCount > 0) {
      msg.client.ch.query(
        'UPDATE afk SET text = $1, since = $4 WHERE userid = $2 AND guildid = $3;',
        [text, msg.author.id, msg.guild.id, Date.now()],
      );
      if (msg.args[0]) {
        embed.setDescription(msg.client.ch.stp(msg.lan.updatedTo, { text }));
        msg.client.ch.reply(msg, { embeds: [embed] });
      }
      if (!msg.args[0]) {
        embed.setDescription(msg.lan.updated);
        msg.client.ch.reply(msg, { embeds: [embed] });
      }
    } else {
      msg.client.ch.query(
        'INSERT INTO afk (userid, text, since, guildid) VALUES ($1, $2, $3, $4);',
        [msg.author.id, text, Date.now(), msg.guild.id],
      );
      if (msg.args[0]) {
        embed.setDescription(msg.client.ch.stp(msg.lan.setTo, { text }));
        msg.client.ch.reply(msg, { embeds: [embed] });
      }
      if (!msg.args[0]) {
        embed.setDescription(msg.lan.set);
        msg.client.ch.reply(msg, { embeds: [embed] });
      }
    }
    return null;
  },
};
