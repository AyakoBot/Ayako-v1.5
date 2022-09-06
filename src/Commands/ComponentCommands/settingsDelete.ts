import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (cmd: CT.ComponentInteraction) => {
  const [, , , name] = cmd.data.custom_id.split(/_/g);
  const uniquetimestamp = Number(cmd.data.custom_id.split(/_/g)[4]);

  if (!name) return;
  if (!uniquetimestamp) return;

  await client.ch.query(
    `DELETE FROM ${
      client.constants.commands.settings.tableNames[
        name as keyof typeof client.constants.commands.settings.tableNames
      ]
    } WHERE uniquetimestamp = $1 AND guildid = $2;`,
    [uniquetimestamp, cmd.guildID],
  );

  (cmd.data as Eris.ComponentInteractionSelectMenuData).values = [name];
  (await import('../SlashCommands/settings/manager')).default(cmd, cmd.language);
};
