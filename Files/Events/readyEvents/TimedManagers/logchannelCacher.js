module.exports = async () => {
  const client = require('../../../BaseClient/DiscordClient');

  const res = await client.ch.query(`SELECT * FROM logchannels;`);

  res?.rows?.forEach((r) => {
    const guild = client.guilds.cache.get(r.guildid);
    if (!guild) return;

    client.logChannels.set(guild.id, r);
  });
};
