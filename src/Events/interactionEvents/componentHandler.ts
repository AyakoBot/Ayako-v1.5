import fs from 'fs';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (cmd: CT.ComponentInteraction) => {
  const rawCommand = await getCommand(cmd);
  if (!rawCommand) return;
  const { command, name } = rawCommand;

  const userID = cmd.data.custom_id.split(/_/g)[1];
  if (userID !== cmd.user.id) {
    client.ch.notYours(cmd, cmd.language);
    return;
  }

  try {
    // eslint-disable-next-line no-console
    console.log(`[ComponentCommand Executed] ${name} | ${cmd.channel.id}`);
    command(cmd, cmd.language);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[ComponentCommand Error] ${name}:`, e);
  }
};

const getCommand = async (cmd: CT.ComponentInteraction) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/ComponentCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: { command: CT.ComponentCommand; name: string } | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.ComponentCommand } = possibleFiles[i];

      if (f.replace('.js', '') === cmd.data.custom_id.split(/_/g)[0]) {
        return { command: possibleFile, name: f.replace('.js', '') };
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};
