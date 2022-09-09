import fs from 'fs';
import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: async (cmd: CT.ComponentInteraction) => {
    const textCommands = await getTextCommands();
    const slashCommands = await getSlashCommands();

    const returnables = Object.entries(cmd.language.commandTypes).map(([key, value]) => ({
      type: 1,
      name: value.toLowerCase().replace(/\s+/, '-'),
      description: cmd.language.Type,
      options: [
        {
          type: 3,
          name: cmd.language.Command.toLowerCase(),
          description: cmd.language.Command,
          required: true,
          choices:
            key === 'textCommands'
              ? textCommands.map((c) => ({
                  name: c.name.toLowerCase().replace(/\s+/, '-'),
                  value: c.name,
                }))
              : slashCommands.map((c) => ({
                  name: c.name.toLowerCase().replace(/\s+/, '-'),
                  value: c.name,
                })),
        },
      ],
    }));

    return returnables;
  },
};

export default editor;

const getSlashCommands = async () => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/SlashCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.SlashCommand[] = files
    .map((_f, i) => possibleFiles[i].default)
    .filter((f): f is CT.SlashCommand => !!f);

  return file;
};

export const getTextCommands = async () => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/TextCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.Command[] = files
    .map((_f, i) => possibleFiles[i].default)
    .filter((f): f is CT.Command => !!f);

  return file;
};
