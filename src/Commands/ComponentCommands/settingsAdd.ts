import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (cmd: CT.ComponentInteraction) => {
  const [, , , name] = cmd.data.custom_id.split(/_/g);
  if (!name) return;

  const uniquetimestamp = Date.now();

  await client.ch.query(
    `INSERT INTO ${
      client.constants.commands.settings.tableNames[
        name as keyof typeof client.constants.commands.settings.tableNames
      ]
    } (active, guildid, uniquetimestamp) VALUES ($1, $2, $3);`,
    [false, cmd.guildID, uniquetimestamp],
  );

  (cmd.data as Eris.ComponentInteractionSelectMenuData).values = [name];
  (await import('../SlashCommands/settings/manager')).default(cmd, cmd.language);
};
