import fs from 'fs';
import type CT from '../../typings/CustomTypings';

export default async (
  cmd: CT.ComponentInteraction,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  if (!('values' in cmd.data)) return;
  const selectedCategory = cmd.data.values[0];
  if (!selectedCategory) return;

  const selectedSetting = cmd.data.values[0];

  const fileToRun = await getFileToRun(selectedSetting);
  if (!fileToRun) return;

  fileToRun.default(cmd, language);
};

const getFileToRun = async (name: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/SlashCommands/settings/settingsf`;
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
