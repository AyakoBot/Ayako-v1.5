import fs from 'fs';
import type CT from '../../typings/CustomTypings';

export default async (cmd: CT.AutocompleteInteraction) => {
  const command = await getCommand(cmd);
  if (!command) return;

  try {
    const lan = cmd.language.slashCommands[command.name as keyof typeof cmd.language.slashCommands];

    // eslint-disable-next-line no-console
    console.log(`[AutocompleteCommand Executed] ${command.name} | ${cmd.channel.id}`);
    command.execute(cmd, { language: cmd.language, lan }, command);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[AutocompleteCommand Error] ${command.name}:`, e);
  }
};

const getCommand = async (cmd: CT.AutocompleteInteraction) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/AutocompleteCommand`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.SlashCommand | undefined | null = files
    .map((_, i) => {
      const { default: possibleFile }: { default: CT.SlashCommand } = possibleFiles[i];
      if (possibleFile.name === cmd.data.name) return possibleFile;
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};
