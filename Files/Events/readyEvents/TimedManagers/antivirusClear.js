module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../../BaseClient/DiscordClient');
    const { ch } = client;
    client.guilds.cache.forEach(async (guild) => {
      const res = await ch.query('SELECT * FROM antiviruslog WHERE guildid = $1;', [guild.id]);
      if (res && res.rowCount > 0) {
        res.rows.forEach(async (r) => {
          const user = await client.users.fetch(r.userid);
          if (r.dateofwarn < +Date.now() - 3600000)
            guild.client.ch.query(
              'DELETE FROM antiviruslog WHERE dateofwarn = $1 AND userid = $2 AND guildid = $3;',
              [r.dateofwarn, user.id, guild.id],
            );
        });
      }
    });
  },
};
