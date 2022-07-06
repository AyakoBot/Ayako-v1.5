import Jobs from 'node-schedule';
import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import { separatorAssigner, oneTimeRunner } from '../../guildEvents/guildMemberUpdate/separator';

export default async () => {
  const roleseparatorsettingsRow = await client.ch
    .query('SELECT * FROM roleseparatorsettings WHERE startat < $1;', [Date.now() - 3900000])
    .then((r: DBT.roleseparatorsettings[] | null) => r || null);
  if (!roleseparatorsettingsRow) return;

  roleseparatorsettingsRow.forEach(async (row) => {
    const guild = client.guilds.get(row.guildid);
    if (!guild) return;

    const existing = separatorAssigner.get(row.guildid);
    if (existing) {
      existing.forEach((e) => e.cancel());
      separatorAssigner.delete(guild.id);
    }

    if (!row.channelid) return;
    if (!row.messageid) return;

    const channel = guild.channels.get(row.channelid) as Eris.TextChannel | null;
    if (!channel) return;
    const message = await channel.getMessage(row.messageid).catch(() => null);
    if (!message) return;

    Jobs.scheduleJob(new Date(Date.now() + 300000), () => {
      oneTimeRunner(
        { guildID: guild.id, author: client.user, channel },
        message,
        { type: 'rich' },
        null,
        row.index === row.length,
      );
    });
  });
};
