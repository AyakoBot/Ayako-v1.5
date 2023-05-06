module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  client.guilds.cache.forEach((g) =>
    client.ch.query(
      `INSERT INTO guilds (guildid, name, icon, banner, invite, membercount) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (guildid) DO UPDATE SET name = $2, icon = $3, banner = $4, invite = $5, membercount = $6;`,
      [
        g.id,
        g.name,
        g.iconURL() ?? null,
        g.bannerURL() ?? null,
        g.vanityURLCode ?? null,
        g.memberCount,
      ],
    ),
  );

  (await client.ch.query(`SELECT * FROM guilds;`).then((r) => r.rows)).forEach((r) => {
    const guild = client.guilds.cache.get(r.guildid);
    if (!guild) client.ch.query(`DELETE FROM guilds WHERE guildid = $1;`, [r.guildid]);
  });
};
