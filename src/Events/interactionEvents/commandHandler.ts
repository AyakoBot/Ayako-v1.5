import fs from 'fs';
import * as Eris from 'eris';
import jobs from 'node-schedule';
import moment from 'moment';
import 'moment-duration-format';
import auth from '../../BaseClient/auth.json' assert { type: 'json' };
import client from '../../BaseClient/ErisClient';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';

const execute = async (cmd: CT.CommandInteraction) => {
  const rawCommand = await getCommand(cmd);
  if (!rawCommand) return;
  const { command } = rawCommand;

  if (!cmd.guild && cmd.channel.type === 1) {
    runDMCommand({ cmd, command });
    return;
  }

  if (command.dmOnly) {
    client.ch.error(cmd, cmd.language.commands.commandHandler.DMonly, cmd.language);
    return;
  }

  if (cmd.user.id !== auth.ownerID) {
    const proceed = runChecks(cmd, command);
    if (!proceed) return;
  }

  commandExe(cmd, command);
};

const runChecks = async (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  const guildAllowed = getGuildAllowed(cmd, command);
  if (!guildAllowed) return false;

  const permAllowed = getPermAllowed(cmd, command);
  if (!permAllowed) return false;

  const commandIsDisabled = await getCommandIsDisabled(cmd, command);
  if (commandIsDisabled) return false;

  const hasCooldown = await getCooldown(cmd, command);
  if (hasCooldown) return false;

  return true;
};

export default execute;

const runDMCommand = async ({
  cmd,
  command,
}: {
  cmd: CT.CommandInteraction;
  command: CT.SlashCommand;
}) => {
  if (command.dm) {
    commandExe(cmd, command);
    return;
  }
  client.ch.error(cmd, cmd.language.commands.commandHandler.GuildOnly, cmd.language);
};

const getCommand = async (cmd: CT.CommandInteraction) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/SlashCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: { command: CT.SlashCommand; name: string } | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.SlashCommand } = possibleFiles[i];

      if (f.replace('.js', '') === cmd.data.name) {
        return { command: possibleFile, name: f.replace('.js', '') };
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};

const getGuildAllowed = (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  if (!cmd.guildID) return true;
  if (command.thisGuildOnly && !command.thisGuildOnly?.includes(cmd.guildID)) return false;
  return true;
};

const getCommandIsDisabled = async (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  const getDisabledRows = async () =>
    client.ch
      .query('SELECT * FROM disabledcommands WHERE guildid = $1 AND active = true;', [cmd.guildID])
      .then((r: DBT.disabledcommands[] | null) => r || null);

  const checkDisabled = (rows: DBT.disabledcommands[]) => {
    const includingRows = rows
      .filter(
        (r) =>
          r.commands?.includes(command.name) &&
          (!r.channels?.length || r.channels?.includes(cmd.channel.id)) &&
          (!r.blroleid || cmd.member?.roles.some((role) => r.blroleid?.includes(role))) &&
          (!r.bluserid || r.bluserid?.includes(cmd.user.id)),
      )
      .filter(
        (r) =>
          !cmd.member?.roles.some((role) => r.bproleid?.includes(role)) &&
          !r.bpuserid?.includes(cmd.user.id),
      );

    if (includingRows.length) return true;
    return false;
  };

  const disabledCommandRows = await getDisabledRows();
  if (disabledCommandRows && disabledCommandRows.length) {
    const disabled = checkDisabled(disabledCommandRows);
    if (disabled) return true;
  }
  return false;
};

const getPermAllowed = async (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  if (command.perm === 0) {
    if (cmd.user.id !== auth.ownerID) {
      client.ch.error(cmd, cmd.language.commands.commandHandler.creatorOnly, cmd.language);
      return false;
    }
    return true;
  }

  const getModRoles = () =>
    client.ch
      .query('SELECT * FROM modroles WHERE guildid = $1 AND active = true;', [cmd.guildID])
      .then((r: DBT.modroles[] | null) => r || null);

  const checkModRoles = async (modRoles: DBT.modroles[]) => {
    if (!command.perm) return { finished: true };

    const applyingRows = modRoles
      ? modRoles.filter((row) => cmd.member?.roles.includes(row.roleid))
      : [];
    if (!applyingRows || !applyingRows.length) return { noRoles: true, finished: false };

    const [roleToApply] = applyingRows.sort((a, b) => {
      const roleA = cmd.guild?.roles.get(b.roleid);
      const roleB = cmd.guild?.roles.get(a.roleid);
      return Number(roleB?.position) - Number(roleA?.position);
    });

    if (
      !roleToApply.whitelistedusers?.includes(cmd.user.id) &&
      roleToApply.whitelistedusers?.length
    ) {
      return { noRoles: false, finished: false };
    }

    if (
      !cmd.member?.roles.some((r) => roleToApply.whitelistedroles?.includes(r)) &&
      roleToApply.whitelistedroles?.length
    ) {
      return { noRoles: false, finished: false };
    }

    if (roleToApply.blacklistedusers?.includes(cmd.user.id)) {
      return { noRoles: false, finished: false };
    }
    if (roleToApply.blacklistedroles?.some((r) => cmd.member?.roles.includes(r))) {
      return { noRoles: false, finished: false };
    }

    if (
      (!roleToApply.perms ||
        !new Eris.Permission(roleToApply.perms).has(BigInt(command.perm)) ||
        !roleToApply.blacklistedcommands ||
        roleToApply.blacklistedcommands.includes(command.name)) &&
      roleToApply.whitelistedcommands &&
      !roleToApply.whitelistedcommands.includes(command.name)
    ) {
      return { noRoles: false, finished: false };
    }
    return { noRoles: false, finished: true };
  };

  if (!command.perm) return true;
  if (!cmd.guildID) return true;

  const perms = new Eris.Permission(command.perm);
  if (!cmd.guild) return true;

  if (command.type === 'mod') {
    const modRoles = await getModRoles();

    if (modRoles) {
      const { noRoles, finished } = await checkModRoles(modRoles);
      if (!noRoles && !finished) {
        client.ch.error(cmd, cmd.language.commands.commandHandler.modRoleError, cmd.language);
        return false;
      }

      if (finished === true) return false;
    }
  }

  if (!cmd.member?.permissions.has(BigInt(command.perm))) {
    client.ch.permError(cmd, command.perm, cmd.language, false);
    return false;
  }

  if (!cmd.guild.members.get(client.user.id)?.permissions.has(perms.allow)) {
    client.ch.permError(cmd, perms.allow, cmd.language, true);
    return false;
  }

  return true;
};

type clEntry = { job: jobs.Job; channel: Eris.Channel; expire: number; command: CT.SlashCommand };
const cooldowns: clEntry[] = [];

const getCooldown = async (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  if (!cmd.guildID) return false;

  const onCooldown = (cl: clEntry) => {
    const getEmote = (secondsLeft: number) => {
      let returned = `**${moment
        .duration(secondsLeft * 1000)
        .format(`s [${cmd.language.time.seconds}]`, { trim: 'all' })}**`;
      let usedEmote = false;

      if (secondsLeft <= 60) {
        returned = `${client.stringEmotes.timers[secondsLeft]} **${cmd.language.time.seconds}**`;
        usedEmote = true;
      }

      return { emote: returned, usedEmote };
    };

    const timeLeft = cl.expire - Date.now();
    const { emote, usedEmote } = getEmote(Math.ceil(timeLeft / 1000));

    client.ch
      .reply(
        cmd,
        {
          content: client.ch.stp(cmd.language.commands.commandHandler.pleaseWait, {
            time: emote,
          }),
          ephemeral: true,
        },
        cmd.language,
      )
      .then((m) => {
        if (!usedEmote && m) {
          jobs.scheduleJob(new Date(Date.now() + (timeLeft - 60000)), () => {
            m.edit({
              content: client.ch.stp(cmd.language.commands.commandHandler.pleaseWait, {
                time: client.stringEmotes.timers[60],
              }),
            }).catch(() => null);
          });
        }
      });
  };

  const getCooldownRows = async () =>
    client.ch
      .query(`SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2;`, [
        cmd.guildID,
        command.name,
      ])
      .then((r: DBT.cooldowns[] | null) => r || null);

  const rows = await getCooldownRows();
  if (!rows) return false;

  const applyingRows = rows.filter(
    (row) =>
      (!row.activechannelid?.length || row.activechannelid?.includes(cmd.channel.id)) &&
      !row.bpchannelid?.includes(cmd.channel.id) &&
      !row.bpuserid?.includes(cmd.user.id) &&
      !row.bproleid?.some((r) => cmd.member?.roles.includes(r)),
  );

  const applyingCooldown = Math.max(...applyingRows.map((r) => Number(r.cooldown) * 1000));
  command.cooldown = applyingCooldown;

  if (cmd.user.id !== auth.ownerID) {
    const cl = cooldowns.find(
      (c) => c.command.name === command.name && c.channel.id === cmd.channel.id,
    );
    if (cl?.channel.id === cmd.channel.id) {
      onCooldown(cl);
      return true;
    }
  }

  const expire = Date.now() + command.cooldown;
  cooldowns.push({
    job: jobs.scheduleJob(new Date(Date.now() + command.cooldown), () => {
      cooldowns.splice(
        cooldowns.findIndex((c) => c.expire === expire),
        1,
      );
    }),
    channel: cmd.channel,
    command,
    expire,
  });

  return false;
};

const commandExe = async (cmd: CT.CommandInteraction, command: CT.SlashCommand) => {
  const lan = cmd.language.slashCommands[command.name as keyof typeof cmd.language.slashCommands];

  try {
    // eslint-disable-next-line no-console
    console.log(`[SlashCommand Executed] ${command.name} | ${cmd.channel.id}`);
    command.execute(cmd, { language: cmd.language, lan }, command);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[SlashCommand Error] ${command.name}:`, e);
  }
};
