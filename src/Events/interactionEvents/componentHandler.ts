import fs from 'fs';
import Jobs from 'node-schedule';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

const cooldowns = new Map();

export default async (cmd: CT.ComponentInteraction) => {
  const rawCommand = await getCommand(cmd);
  if (!rawCommand) return;
  const { command, name } = rawCommand;

  if (command.cooldown && cooldowns.has(cmd.user.id)) {
    const timeleft = Math.abs(cooldowns.get(cmd.user.id) - Date.now());

    client.ch.reply(
      cmd,
      {
        content: client.ch.stp(cmd.language.commands.commandHandler.pleaseWait, {
          time: `${Math.ceil(timeleft / 1000)} ${cmd.language.time.seconds}`,
        }),
        ephemeral: true,
      },
      cmd.language,
    );
    return;
  }

  if (command.cooldown) {
    cooldowns.set(cmd.user.id, Date.now());
    Jobs.scheduleJob(new Date(Date.now() + command.cooldown), () => {
      cooldowns.delete(cmd.user.id);
    });
  }

  try {
    const lan = cmd.language.slashCommands[name as keyof typeof cmd.language.slashCommands];

    // eslint-disable-next-line no-console
    console.log(`[ComponentCommand Executed] ${name} | ${cmd.channel.id}`);
    command.execute(cmd, { language: cmd.language, lan }, command);
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

  const file: { command: CT.SlashCommand; name: string } | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.SlashCommand } = possibleFiles[i];

      if (f.replace('.js', '') === cmd.data.custom_id) {
        return { command: possibleFile, name: f.replace('.js', '') };
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};
