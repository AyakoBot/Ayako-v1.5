const Discord = require('discord.js');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  const res = await client.ch.query('SELECT * FROM stats;');
  const userCount = res.rows[0].allusers;
  const random = Math.round(Math.random() * 9);

  if (random > 5) {
    client.user.setActivity(
      `${userCount} users | v1.5- | ${client.constants.standard.prefix}invite`,
      {
        type: Discord.ActivityType.Watching,
      },
    );
  }
  if (random < 5) {
    client.user.setActivity(
      `${client.guilds.cache.size} servers | v1.5- | Default Prefix: ${client.constants.standard.prefix}`,
      {
        type: Discord.ActivityType.Competing,
      },
    );
  }
};
