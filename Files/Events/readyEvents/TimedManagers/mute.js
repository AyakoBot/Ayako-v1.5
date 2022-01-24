module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../../BaseClient/DiscordClient');
    const { ch } = client;
    client.guilds.cache.forEach(async (guild) => {
      const res = await ch.query('SELECT * FROM warns WHERE type = $1 AND guildid = $2;', [
        'Mute',
        guild.id,
      ]);
      if (res && res.rowCount > 0) {
        res.rows.forEach(async (r) => {
          if (r.closed === false) {
            const user = await client.users.fetch(r.userid);
            const end = r.duration;
            if (end < Date.now()) {
              if (guild && guild.id) {
                if (guild && guild.id) {
                  if (user && user.id) {
                    const language = await ch.languageSelector(guild);
                    client.emit(
                      'muteRemove',
                      client.user,
                      user,
                      guild,
                      language.ready.unmute.reason,
                    );
                    closed(guild, user, end);
                  }
                }
              }
            }
          }
        });
      }
    });
  },
};

function closed(guild, user, end) {
  const { client } = guild;
  client.ch.query(
    'UPDATE warns SET closed = $1 WHERE guildid = $2 AND userid = $3 AND type = $4 AND duration = $5;',
    [true, guild.id, user.id, 'Mute', end],
  );
}
