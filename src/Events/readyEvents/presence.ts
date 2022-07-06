import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';

export default async () => {
  const random = Math.floor(Math.random() * 3);
  const users = await client.ch
    .query(`SELECT allusers FROM stats;`)
    .then((r: DBT.stats[] | null) => (r ? r[0].allusers : null));

  const activities: { name: string; type: number; url?: string }[] = [];

  switch (random) {
    case 1: {
      activities.push({
        name: `${client.guilds.size} Servers | v1.6- | Default Prefix: ${client.constants.standard.prefix}`,
        type: 5,
      });
      break;
    }
    case 2: {
      activities.push({
        name: `${users} Users | v1.6- | ${client.constants.standard.prefix}invite`,
        type: 3,
      });
      break;
    }
    default: {
      activities.push({
        type: 1,
        url: 'https://www.twitch.tv/lars_und_so_',
        name: `Development | v1.6- | Default Prefix: ${client.constants.standard.prefix}`,
      });
      break;
    }
  }
};
