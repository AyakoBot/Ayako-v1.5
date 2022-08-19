module.exports = async () => {
  const client = require('../../../BaseClient/DiscordClient');

  const res = await client.ch.query('SELECT * FROM antiviruslog;');

  res.rows.forEach(async (row) => {
    const guild = client.guilds.cache.get(row.guildid);
    if (!guild) {
      client.ch.query('DELETE FROM antiviruslog WHERE guildid = $1;', [guild.id]);
      return;
    }

    if (!res || !res.rowCount) return;

    res.rows.forEach((r) => {
      if (r.dateofwarn > Date.now() - 3600000) return;

      guild.client.ch.query(
        'DELETE FROM antiviruslog WHERE dateofwarn = $1 AND userid = $2 AND guildid = $3;',
        [r.dateofwarn, r.userid, guild.id],
      );
    });
  });
};
