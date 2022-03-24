const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, targets, reason, guild) {
    const banPromises = targets.map((target) =>
      guild.bans
        .create(target, { deleteMessageDays: 7, reason: `${executor.username} | ${reason}` })
        .catch((e) => `${target} | ${e}`),
    );

    const bans = await Promise.all(banPromises);

    const attachment = guild.client.ch.txtFileWriter(
      bans.map((ban) =>
        typeof ban === 'object' || !Number.isNaN(+ban) === 'number'
          ? `User ID ${ban.user?.id ?? ban.id ?? ban} | User Tag: ${
              ban.user?.tag ?? ban.tag ?? 'Unknown'
            }`
          : ban,
      ),
    );

    const res = await guild.client.ch.query('SELECT modlogs FROM logchannels WHERE guildid = $1;', [
      guild.id,
    ]);

    if (res && res.rowCount) {
      const con = guild.client.constants.mod.banAdd;
      const language = await guild.client.ch.languageSelector(guild);
      const lan = language.antiraid.banAdd;

      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setAuthor({
          name: guild.client.ch.stp(lan.author, {
            amount: bans.filter((b) => typeof b === 'object' || !Number.isNaN(+b) === 'number')
              .length,
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
