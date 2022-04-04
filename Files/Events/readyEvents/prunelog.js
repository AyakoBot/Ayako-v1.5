const Builders = require('@discordjs/builders');

module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../BaseClient/DiscordClient');
    client.guilds.cache.forEach(async (guild) => {
      const { ch } = client;
      const Constants = client.constants;
      const language = await ch.languageSelector(guild);
      const lan = language.ready.prune;
      const con = Constants.prune;
      const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
      if (res && res.rowCount > 0) {
        const r = res.rows[0];
        const logchannel = client.channels.cache.get(r.guildevents);
        if (logchannel && logchannel.id) {
          let entry;
          if (guild.me.permissions.has(128n)) {
            const audits = await guild.fetchAuditLogs({ limit: 10, type: 21 });
            if (audits && audits.entries) {
              entry = audits.entries.sort((a, b) => b.id - a.id);
              entry = entry.first();
              if (entry && ch.getUnix(entry.id) > Date.now() - 120000) {
                const embed = new Builders.UnsafeEmbedBuilder()
                  .setAuthor({
                    name: lan.author,
                    iconURL: con.author.image,
                  })
                  .setDescription(
                    ch.stp(lan.description, {
                      user: entry.executor,
                      amount: entry.extra.removed,
                      days: entry.extra.days,
                    }),
                  )
                  .setTimestamp()
                  .setColor(con.color);
                if (entry.reason) embed.addFields({ name: language.reason, value: entry.reason });
                ch.send(logchannel, { embeds: [embed] }, 5000);
              }
            }
          }
        }
      }
    });
  },
};
