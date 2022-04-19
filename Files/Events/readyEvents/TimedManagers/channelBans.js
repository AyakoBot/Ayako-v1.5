module.exports = {
  execute: async () => {
    const client = require('../../../BaseClient/DiscordClient');
    client.guilds.cache.forEach(async (guild) => {
      const res = await client.ch.query(
        'SELECT * FROM punish_tempchannelbans WHERE guildid = $2;',
        [guild.id],
      );
      if (!res || !res.rowCount) return;

      res.rows.forEach(async (r) => {
        const end = r.duration + r.uniquetimestamp;

        if (end > Date.now()) return;
        if (!guild) return;

        const user = await client.users.fetch(r.userid).catch(() => {});

        if (!user) return;

        const language = await client.ch.languageSelector(guild);
        client.emit(
          'modBaseEvent',
          { executor: client.user, target: user, reason: language.ready.unmute.reason, guild },
          'channelbanRemove',
        );
      });
    });
  },
};
