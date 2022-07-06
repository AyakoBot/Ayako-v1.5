import Jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import { endReminder } from '../../messageEvents/messageCreate/disboard';

export default async () => {
  const disboardRows = (
    await client.ch
      .query(`SELECT * FROM disboard WHERE active = true;`)
      .then((r: DBT.disboard[] | null) => r || null)
  )?.filter((r) => client.guilds.has(r.guildid));
  if (!disboardRows) return;

  disboardRows.forEach((row) => {
    const guild = client.guilds.get(row.guildid);
    if (!guild) return;

    if (!row.channelid) return;
    const channel = guild.channels.get(row.channelid);
    if (!channel) return;

    const endTime = Number(row.nextbump) <= Date.now() ? 100 : Number(row.nextbump);

    client.disboardBumpReminders.set(
      guild.id,
      Jobs.scheduleJob(new Date(endTime), async () => {
        const language = await client.ch.languageSelector(null);

        endReminder(guild, language);
      }),
    );
  });
};
