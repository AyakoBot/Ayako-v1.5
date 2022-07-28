import type * as Eris from 'eris';
import fs from 'fs';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  cmd: CT.CommandInteraction | CT.ComponentInteraction,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const { selectedSetting, isSlashCommand, isComponent } = getSelectedSetting(cmd);
  if (!selectedSetting) return;

  const settingsFile = await getSettingsFile(selectedSetting);
  if (!settingsFile) throw new Error(`Settings File for Setting ${selectedSetting} does not exist`);

  const con =
    client.constants.commands.settings.settings[
      selectedSetting as keyof typeof client.constants.commands.settings.settings
    ];
  if (!con) throw new Error(`Constants for Setting ${selectedSetting} do not exist`);

  const lan =
    language.slashCommands.settings.settings[
      selectedSetting as keyof typeof language.slashCommands.settings.settings
    ];
  if (!lan) throw new Error(`Lan for Setting ${selectedSetting} does not exist`);
};

const getSelectedSetting = (cmd: CT.CommandInteraction | CT.ComponentInteraction) => {
  if (!('values' in cmd.data) && !('options' in cmd.data)) return { selectedSetting: null };

  if ('values' in cmd.data) {
    return { selectedSetting: cmd.data.values[0], isSlashCommand: false, isComponent: true };
  }

  const { options } = cmd.data;
  if (!options) return { selectedSetting: null };

  const option = options.find((s) => s.name === 'setting');
  if (!option) return { selectedSetting: null };
  if (!('value' in option)) return { selectedSetting: null };

  return { selectedSetting: option.value as string, isSlashCommand: true, isComponent: false };
};

const getSettingsFile = async (name: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/SlashCommands/settings/settings`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.SettingsFile | undefined = files
    .map((fileName, i) => {
      const f: CT.SettingsFile = possibleFiles[i];
      if (fileName.replace('.js', '') === name) {
        return f;
      }
      return null;
    })
    .filter((f): f is CT.SettingsFile => !!f)
    .shift();

  return file;
};
