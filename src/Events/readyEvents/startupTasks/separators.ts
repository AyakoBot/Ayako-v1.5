import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import { oneTimeRunner } from '../../guildEvents/guildMemberUpdate/separator';

export default async () => {
  const roleseparatorsettingsRows = (
    await client.ch
      .query('SELECT * FROM roleseparatorsettings WHERE stillrunning = true;')
      .then((r: DBT.roleseparatorsettings[] | null) => r || null)
  )?.filter((r) => client.guilds.has(r.guildid));
  if (!roleseparatorsettingsRows) return;

  roleseparatorsettingsRows.forEach(async (row) => {
    const guild = client.guilds.get(row.guildid);
    if (!guild) return;
    if (!row.channelid) return;
    if (!row.messageid) return;

    const message = await (guild.channels.get(row.channelid) as Eris.TextChannel)
      ?.getMessage(row.messageid)
      .catch(() => null);
    if (!message) return;

    oneTimeRunner({ guildID: guild.id, author: client.user, channel: message.channel }, message, {
      type: 'rich',
    });
  });
};
