const Discord = require('discord.js');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  const random = Math.round(Math.random() * 9);
  const users = await getUsers(client);

  if (random > 5) {
    client.user.setActivity(`${users} Users | v1.5- | ${client.constants.standard.prefix}invite`, {
      type: Discord.ActivityType.Watching,
    });
  }
  if (random < 5) {
    client.user.setActivity(
      `${client.guilds.cache.size} Servers | v1.5- | Default Prefix: ${client.constants.standard.prefix}`,
      {
        type: Discord.ActivityType.Competing,
      },
    );
  }
};

const getUsers = async (client) => {
  const res = await client.ch.query(`SELECT allusers FROM stats;`);
  if (res && res.rowCount) return res.rows[0].allusers;
  return client.users.cache.size;
};
