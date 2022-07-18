import jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  const giveawaysRows = (
    await client.ch
      .query(`SELECT * FROM giveaways WHERE ended = false;`)
      .then((r: DBT.giveaways[] | null) => r || null)
  )?.filter((r) => client.guilds.has(r.guildid));
  if (!giveawaysRows) return;

  giveawaysRows.forEach(async (row) => {
    const guild = client.guilds.get(row.guildid);
    if (!guild) return;

    const language = await client.ch.languageSelector(guild.id);
    const lan = language.slashCommands.giveaway.end;

    if (Number(row.endtime) > Date.now()) {
      const job = jobs.scheduleJob(new Date(Number(row.endtime)), async () => {
        (await import('../../../Commands/SlashCommands/giveaway/end')).end(row, lan, language);
      });

      client.giveaways.set(`${row.msgid}-${row.guildid}`, job);
    } else (await import('../../../Commands/SlashCommands/giveaway/end')).end(row, lan, language);
  });
};
