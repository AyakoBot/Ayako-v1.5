const Discord = require('discord.js');

module.exports = {
  async execute(executor, targets, reason, guild) {
    const kickPromises = targets.map((target) =>
      guild.members.kick(target, `${executor.username} | ${reason}`).catch((e) => {
        return `${target} | ${e}`;
      }),
    );

    const kicks = await Promise.all(kickPromises);

    const attachment = guild.client.ch.txtFileWriter(
      kicks.map((kicked) =>
        typeof kicked === 'object' || !Number.isNaN(+kicked) === 'number'
          ? `User ID ${kicked.user?.id ?? kicked.id ?? kicked} | User Tag: ${
              kicked.user?.tag ?? kicked.tag ?? 'Unkown'
            }`
          : kicked,
      ),
    );

    const res = await guild.client.ch.query(`SELECT modlogs FROM logchannels WHERE guildid = $1;`, [
      guild.id,
    ]);

    if (res && res.rowCount) {
      const con = guild.client.constants.mod.kickAdd;
      const language = await guild.client.ch.languageSelector(guild);
      const lan = language.antiraid.kickAdd;

      const embed = new Discord.UnsafeEmbed()
        .setColor(con.color)
        .setAuthor({
          name: guild.client.ch.stp(lan.author, {
            amount: `${
              kicks.filter((k) => typeof k === 'object' || !Number.isNaN(+k) === 'number').length
            }`,
          }),
          iconURL: con.author.image,
          url: guild.client.constants.standard.invite,
        })
        .setTimestamp()
        .addFields({ name: language.reason, value: `${reason}` });

      res.rows[0].modlogs.forEach((logChannel) => {
        const channel = guild.channels.cache.get(logChannel);
        guild.client.ch.send(channel, { embeds: [embed], files: [attachment] });
      });
    }
  },
};
