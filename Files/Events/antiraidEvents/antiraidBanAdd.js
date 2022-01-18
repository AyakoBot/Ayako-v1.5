const Discord = require('discord.js');

module.exports = {
  async execute(executor, targets, reason, guild) {
    const banPromises = targets.map((target) =>
      guild.bans
        .create(target, { days: 7, reason: `${executor.username} | ${reason}` })
        .catch((e) => `${target} | ${e}`),
    );

    const bans = await Promise.all(banPromises);

    const path = guild.client.ch.txtFileWriter(
      guild,
      bans.map((ban) =>
        typeof ban === 'object' || !Number.isNaN(+ban) === 'number'
          ? `User ID ${ban.user?.id ?? ban.id ?? ban} | User Tag: ${
              ban.user?.tag ?? ban.tag ?? 'Unknown'
            }`
          : ban,
      ),
      'antiraidPunishment',
    );

    const res = await guild.client.ch.query(`SELECT modlogs FROM logchannels WHERE guildid = $1;`, [
      guild.id,
    ]);

    if (res && res.rowCount) {
      const con = guild.client.constants.mod.banAdd;
      const language = await guild.client.ch.languageSelector(guild);
      const lan = language.antiraid.banAdd;

      const embed = new Discord.MessageEmbed()
        .setColor(con.color)
        .setAuthor({
          name: guild.client.ch.stp(lan.author, {
            amount:
              bans.filter((b) => typeof b === 'object' || !Number.isNaN(+b) === 'number').length ||
              0,
          }),
          iconURL: con.author.image,
          url: guild.client.constants.standard.invite,
        })
        .setTimestamp()
        .addField(language.reason, `${reason}`);

      res.rows[0].modlogs.forEach((logChannel) => {
        const channel = guild.channels.cache.get(logChannel);
        guild.client.ch.send(channel, { embeds: [embed], files: [path] });
      });
    }
  },
};
