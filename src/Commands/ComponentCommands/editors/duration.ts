import type * as Eris from 'eris';
import ms from 'ms';
import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';
import InteractionCollector from '../../../BaseClient/Other/InteractionCollector';
import SlashCommandCollector from '../../../BaseClient/Other/SlashCommandCollector';

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

    const type = settingsType[field as keyof typeof settingsType];
    if (!type) throw new Error(`Missing type for "${type}" in "${name}"`);

    const managedEditor = await (await import('./getManagedEditor')).default(typeOfField);
    if (!managedEditor) throw new Error(`Managed Editor for "${typeOfField}" not found`);

    const command = await client.createGuildCommand(cmd.guildID, {
      type: 1,
      name: 'edit',
      description: cmd.language.slashCommands.settings.commandDesc,
      dm_permissions: false,
      default_member_permissions: 32,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options: await managedEditor.getOptions(cmd),
    });

    const embed = await (
      await import('../settingsEditingEmbed')
    ).default(cmd, oldRow, editor, command);
    const components = client.ch.buttonRower([
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
    ]);

    await cmd
      .editParent({
        embeds: [embed],
        components,
      })
      .catch(() => null);

    const returnedFromCollector = await handleCollectors(cmd, name, field, oldRow, command);
    await cmd.guild.deleteCommand(command.id).catch(() => null);
    return returnedFromCollector;
  },
};

export default editor;

const handleCollectors = async (
  cmd: CT.ComponentInteraction,
  name: string,
  field: string,
  oldRow: CT.BasicReturnType,
  c: Eris.ApplicationCommand,
): Promise<CT.BasicReturnType | null> => {
  let finishedData = (await import('./getFinishedData')).default(oldRow, field, c);
  const newRow: CT.BasicReturnType = {};

  Object.entries(oldRow).forEach(([k, v]) => {
    newRow[k] = v;
  });

  return new Promise((res) => {
    const interactionCollector = new InteractionCollector(cmd.message, 360000);
    const commandCollector = new SlashCommandCollector(cmd.channel, 360000);

    interactionCollector.on('end', async (reason: string) => {
      if (reason === 'time') {
        (cmd.data as Eris.ComponentInteractionSelectMenuData).values = [name];
        (await import('../../SlashCommands/settings/manager')).default(cmd, cmd.language);

        res(null);
      }
    });

    interactionCollector.on('collect', async (button: Eris.ComponentInteraction) => {
      if (!button.member) return;
      if (button.member.id !== cmd.user.id) {
        client.ch.notYours(button, cmd.language);
        return;
      }

      if (button.data.custom_id === 'nocmd_settings_back') {
        (cmd.data as Eris.ComponentInteractionSelectMenuData).values = [name];
        (await import('../../SlashCommands/settings/manager')).default(
          button as CT.ComponentInteraction,
          cmd.language,
        );
        button.acknowledge();
        res(null);

        interactionCollector.stop();
        commandCollector.stop();
        return;
      }

      if (button.data.custom_id === 'nocmd_settings_done') {
        interactionCollector.stop();
        commandCollector.stop();

        button.acknowledge();
        res(newRow);
      }
    });

    commandCollector.on('collect', async (command: Eris.CommandInteraction) => {
      if (!command.member) return;
      if (command.member.id !== cmd.user.id) {
        client.ch.notYours(command, cmd.language);
        return;
      }

      if (!command.data.options || !('values' in command.data.options)) return;

      command.data.options.forEach((option) => {
        if (!('value' in option)) return;

        const msValue = String(option.value)
          .split(/\s+/g)
          .map((s) => ms(s))
          .reduce((partialSum, a) => partialSum + a, 0);

        if (Array.isArray(finishedData)) {
          if (!finishedData.includes(msValue)) {
            finishedData.push(msValue);
          } else finishedData.splice(finishedData.indexOf(msValue), 1);
        } else {
          finishedData = msValue;
        }

        newRow[field as keyof typeof newRow] = String(finishedData);
      });

      await command.createMessage({ content: client.stringEmotes.tick }).catch(() => null);
      command.deleteOriginalMessage().catch(() => null);

      const embed = await (await import('../settingsEditingEmbed')).default(cmd, newRow, editor, c);
      cmd.message.edit({ embeds: [embed] }).catch(() => null);
    });
  });
};
