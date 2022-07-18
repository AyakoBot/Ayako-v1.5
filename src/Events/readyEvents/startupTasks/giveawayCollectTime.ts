import jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  const giveawaysRows = await client.ch
    .query(`SELECT * FROM giveawaycollecttime;`)
    .then((r: DBT.giveawaycollecttime[] | null) => r || null);
  if (!giveawaysRows) return;

  giveawaysRows.forEach(async (row) => {
    const giveawayRow = await client.ch
      .query(`SELECT * FROM giveaways WHERE msgid = $1;`, [row.giveaway])
      .then((r: DBT.giveaways[] | null) => (r ? r[0] : null));
    if (!giveawayRow) return;

    const user = await client.ch.getUser(row.userid);
    if (!user) return;

    if (Number(row.endtime) > Date.now()) {
      const job = jobs.scheduleJob(new Date(Number(row.endtime)), async () => {
        (await import('../../../Commands/SlashCommands/giveaway/end')).runTimeEnded(
          giveawayRow,
          user,
          row.msgid,
          row.endtime,
        );
      });

      client.giveawayClaimTimeout.set(`${row.msgid}-${row.userid}`, job);
    } else {
      (await import('../../../Commands/SlashCommands/giveaway/end')).runTimeEnded(
        giveawayRow,
        user,
        row.msgid,
        row.endtime,
      );
    }
  });
};
