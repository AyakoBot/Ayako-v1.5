import fetch from 'node-fetch';
import { AutoPoster } from 'topgg-autoposter';
import Jobs from 'node-schedule';
import auth from '../../BaseClient/auth.json';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';

const APIDiscordBotList = 'https://discordbotlist.com/api/v1/bots/650691698409734151/stats';
const APIDiscordBots = 'https://discord.bots.gg/api/v1/bots/650691698409734151/stats';

export default async () => {
  let allusers = await client.ch
    .query('SELECT allusers FROM stats;')
    .then((r: DBT.stats[] | null) => (r ? Number(r[0].allusers) : null));
  if (!allusers) allusers = client.users.size;

  Jobs.scheduleJob('0 0 */1 * * *', () => {
    fetch(APIDiscordBots, {
      method: 'post',
      body: JSON.stringify({
        guildCount: client.guilds.size,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.DBToken,
      },
    }).catch(() => null);

    fetch(APIDiscordBotList, {
      method: 'post',
      body: JSON.stringify({
        users: allusers,
        guilds: client.guilds.size,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.DBListToken,
      },
    }).catch(() => null);
  });

  AutoPoster(auth.topGGtoken, client);
};
