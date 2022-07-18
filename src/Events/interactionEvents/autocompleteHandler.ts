import fs from 'fs';
import type CT from '../../typings/CustomTypings';

export default async (cmd: CT.AutocompleteInteraction) => {
  const rawCommand = await getCommand(cmd);
  if (!rawCommand) return;
  const { command, name } = rawCommand;

  try {
    const lan = cmd.language.slashCommands[name as keyof typeof cmd.language.slashCommands];

    // eslint-disable-next-line no-console
    console.log(`[AutocompleteCommand Executed] ${name} | ${cmd.channel.id}`);
    command(cmd, { language: cmd.language, lan });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[AutocompleteCommand Error] ${name}:`, e);
  }
};

const getCommand = async (cmd: CT.AutocompleteInteraction) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/AutocompleteCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: { command: CT.AutocompleteCommand; name: string } | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.AutocompleteCommand } = possibleFiles[i];

      if (f.replace('.js', '') === cmd.data.name) {
        return { command: possibleFile, name: f.replace('.js', '') };
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};
