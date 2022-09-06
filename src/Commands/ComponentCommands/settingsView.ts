import type * as Eris from 'eris';
import fs from 'fs';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (cmd: CT.ComponentInteraction) => {
  const args = (cmd.data as Eris.ComponentInteractionSelectMenuData).values[0].split(/_/g);
  const [, , , name] = args;
  const uniquetimestamp = Number(args[4]);

  if (!name) return;
  if (!uniquetimestamp) return;

  const setting = await getSettingsFile(name);
  if (!setting) return;

  const baseObject: CT.MultiSettingsObject = {
    language: cmd.language,
    setting,
    interactions: [cmd],
    embed: (await import('../SlashCommands/settings/manager')).getBaseEmbed({
      language: cmd.language,
      name: setting.name,
    }),
    uniquetimestamp,
  };

  await setting.displayEmbed(baseObject);
  const components = await setting.buttons(baseObject);
  components.push([
    {
      type: 2,
      custom_id: `settings_${baseObject.interactions[0].user.id}_gotosetting_${setting.name}`,
      emoji: { id: null, name: '🔙' },
      style: 4,
    },
    {
      type: 2,
      custom_id: `settings_${baseObject.interactions[0].user.id}_delete_${setting.name}_${baseObject.uniquetimestamp}`,
      emoji: client.objectEmotes.trash,
      style: 2,
    },
  ]);

  await (
    await import('../SlashCommands/settings/manager')
  ).edit(baseObject as unknown as CT.BaseSettingsObject, client.ch.buttonRower(components));
};

const getSettingsFile = async (name: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/SlashCommands/settings/settings`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.MultiSettings | undefined = files
    .map((fileName, i) => {
      const f: CT.MultiSettings = possibleFiles[i].default;
      if (fileName.replace('.js', '') === name) {
        return f;
      }
      return null;
    })
    .filter((f): f is CT.MultiSettings => !!f)
    .shift();

  return file;
};
