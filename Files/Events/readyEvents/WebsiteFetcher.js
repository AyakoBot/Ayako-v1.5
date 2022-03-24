const jobs = require('node-schedule');
const auth = require('../../BaseClient/auth.json');

const APIDiscordBotList = 'https://discordbotlist.com/api/v1/bots/650691698409734151/stats';
const APIDiscordBots = 'https://discord.bots.gg/api/v1/bots/650691698409734151/stats';

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');

  let allusers = await getAllUsers(client);
  if (!allusers) allusers = client.users.cache.size;

  jobs.scheduleJob('0 0 */1 * * *', () => {
    fetch(APIDiscordBots, {
      method: 'post',
      body: JSON.stringify({
        guildCount: client.guilds.cache.size,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.DBToken,
      },
    });

    fetch(APIDiscordBotList, {
      method: 'post',
      body: JSON.stringify({
        users: allusers,
        guilds: client.guilds.cache.size,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.DBListToken,
      },
    });
  });

  jobs.scheduleJob('0 */15 * * * *', () => {
    dbl.postStats(client.guilds.cache.size).catch(() => {});
  });
};

const getAllUsers = async (client) => {
  const res = await client.ch.query('SELECT * FROM stats;');
  if (res && res.rowCount) return res.rows[0].allusers;
  return null;
};
