import jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import { end } from '../../../SlashCommands/giveaway/end';

export default async () => {
  const giveawaysRows = (
    await client.ch
      .query(`SELECT * FROM giveaways WHERE ended = false;`)
      .then((r: DBT.giveaways[] | null) => r || null)
  )?.filter((r) => client.guilds.has(r.guildid));
  if (!giveawaysRows) return;

  giveawaysRows.forEach((row) => {
    if (Number(row.endtime) > Date.now()) {
      const job = jobs.scheduleJob(new Date(Number(row.endtime)), () => {
        end(row);
      });

      client.giveaways.set(`${row.msgid}-${row.guildid}`, job);
    } else end(row);
  });
};
