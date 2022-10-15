import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';

const editor: CT.Editor = {
  handles: ['duration', 'durations'],
  run: async (cmd, oldRow, typeOfField) => {
    if (!cmd.guildID) return null;
    if (!cmd.guild) return null;

    const [, , , , name, field] = cmd.data.custom_id.split(/_/g);

    const settingsType =
      client.constants.commands.settings.settings[
        name as keyof typeof client.constants.commands.settings.settings
      ];
    if (!settingsType) throw new Error(`Missing settingsType for "${name}"`);

    const type = settingsType[field as keyof typeof settingsType] as string;
    if (!type) throw new Error(`Missing type for "${type}" in "${name}"`);

    const managedEditor = await (await import('./getManagedEditor')).default(typeOfField);
    if (!managedEditor) throw new Error(`Managed Editor for "${typeOfField}" not found`);

    const embed = await (await import('../settingsEditingEmbed')).default(cmd, oldRow, editor);
    const components = client.ch.buttonRower([
      [
        {
          type: client.constants.commands.settings.selectMenuTypes[
            (type.endsWith('s')
              ? type.slice(0, type.length - 1)
              : settingsType) as keyof typeof client.constants.commands.settings.selectMenuTypes
          ],
        },
      ],
      [
        {
          type: 2,
          emoji: client.objectEmotes.tickWithBackground,
          custom_id: 'nocmd_settings_done',
          style: 3,
        },
        {
          type: 2,
          emoji: { name: '🔙' },
          custom_id: 'nocmd_settings_back',
          style: 4,
        },
      ],
    ]);

    await cmd
      .editParent({
        embeds: [embed],
        components,
      })
      .catch(() => null);

    return returnedFromCollector;
  },
};

export default editor;
