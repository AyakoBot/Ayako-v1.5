import * as Eris from 'eris';
import fs from 'fs';
import * as jobs from 'node-schedule';
import moment from 'moment';
import type * as CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import auth from '../../../BaseClient/auth.json' assert { type: 'json' };
import client from '../../../BaseClient/ErisClient';
import InteractionCollector from '../../../BaseClient/Other/InteractionCollector';
import 'moment-duration-format';

const execute = async (msg: CT.Message) => {
  const prefix = await getPrefix(msg);
  if (!prefix) return;

  const args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);

  const { file: command, triedCMD } = await getCommand(args);
  if (!command) return;

  if (!msg.guild && msg.channel.type === 1) {
    runDMCommand({ msg, command }, triedCMD);
    return;
  }

  if (command.dmOnly) {
    client.ch.error(msg, msg.language.commands.commandHandler.DMonly, msg.language);
    return;
  }

  if (msg.author.id !== auth.ownerID) {
    const proceed = runChecks(msg, command);
    if (!proceed) return;
  }

  const proceedEdit = await editCheck(msg, command);
  if (!proceedEdit) return;

  commandExe(msg, command, triedCMD);
};

const runChecks = async (msg: CT.Message, command: CT.Command) => {
  const guildAllowed = getGuildAllowed(msg, command);
  if (!guildAllowed) return false;

  const permAllowed = getPermAllowed(msg, command);
  if (!permAllowed) return false;

  const commandIsDisabled = await getCommandIsDisabled(msg, command);
  if (commandIsDisabled) return false;

  const hasCooldown = await getCooldown(msg, command);
  if (hasCooldown) return false;

  return true;
};

export default execute;

const runDMCommand = async (
  { msg, command }: { msg: CT.Message; command: CT.Command },
  triedCMD?: unknown,
) => {
  if (command.dm) {
    commandExe(msg, command, triedCMD);
    return;
  }
  client.ch.error(msg, msg.language.commands.commandHandler.GuildOnly, msg.language);
};

export const getPrefix = async (msg: Eris.Message) => {
  const prefixStandard = client.constants.standard.prefix;
  const prefixCustom = await getCustomPrefix(msg);

  let prefix;

  if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
  else if (prefixCustom && msg.content.toLowerCase().startsWith(prefixCustom)) {
    prefix = prefixCustom;
  } else return null;

  return prefix;
};

const getCustomPrefix = async (msg: Eris.Message) => {
  if (!msg.guildID) return undefined;

  return client.ch
    .query(
      'SELECT prefix FROM guildsettings WHERE guildid = $1;',
      [msg.guildID],
      msg.author.id === '564052925828038658',
    )
    .then((r: DBT.guildsettings[] | null) => (r ? r[0].prefix : null));
};

export const getCommand = async (args: string[]) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/TextCommands`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const searchedFileName = args.shift()?.toLowerCase();
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  let triedCMD;
  const file: CT.Command = await files
    .map((_, i) => {
      const { default: possibleFile }: { default: CT.Command } = possibleFiles[i];
      if (
        searchedFileName &&
        (possibleFile.name === searchedFileName || possibleFile.aliases?.includes(searchedFileName))
      ) {
        if (possibleFile.takesFirstArg && !args[0]) {
          triedCMD = possibleFile;
          return import(`${dir}/cmdhelp`);
        }
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return { file: file || null, triedCMD };
};

const getGuildAllowed = (msg: Eris.Message, command: CT.Command) => {
  if (!msg.guildID) return true;
  if (command.thisGuildOnly && !command.thisGuildOnly?.includes(msg.guildID)) return false;
  return true;
};

const getCommandIsDisabled = async (msg: CT.Message, command: CT.Command) => {
  const getDisabledRows = async () =>
    client.ch
      .query('SELECT * FROM disabledcommands WHERE guildid = $1 AND active = true;', [msg.guildID])
      .then((r: DBT.disabledcommands[] | null) => r || null);

  const checkDisabled = (rows: DBT.disabledcommands[]) => {
    const includingRows = rows
      .filter(
        (r) =>
          r.commands?.includes(command.name) &&
          (!r.channels?.length || r.channels?.includes(msg.channel.id)) &&
          (!r.blroleid || msg.member?.roles.some((role) => r.blroleid?.includes(role))) &&
          (!r.bluserid || r.bluserid?.includes(msg.author.id)),
      )
      .filter(
        (r) =>
          !msg.member?.roles.some((role) => r.bproleid?.includes(role)) &&
          !r.bpuserid?.includes(msg.author.id),
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

const getPermAllowed = async (msg: CT.Message, command: CT.Command) => {
  if (command.perm === 0) {
    if (msg.author.id !== auth.ownerID) {
      client.ch.error(msg, msg.language.commands.commandHandler.creatorOnly, msg.language);
      return false;
    }
    return true;
  }

  const getModRoles = () =>
    client.ch
      .query('SELECT * FROM modroles WHERE guildid = $1 AND active = true;', [msg.guildID])
      .then((r: DBT.modroles[] | null) => r || null);

  const checkModRoles = async (modRoles: DBT.modroles[]) => {
    if (!command.perm) return { finished: true };

    const applyingRows = modRoles
      ? modRoles.filter((row) => msg.member?.roles.includes(row.roleid))
      : [];
    if (!applyingRows || !applyingRows.length) return { noRoles: true, finished: false };

    const [roleToApply] = applyingRows.sort((a, b) => {
      const roleA = msg.guild?.roles.get(b.roleid);
      const roleB = msg.guild?.roles.get(a.roleid);
      return Number(roleB?.position) - Number(roleA?.position);
    });

    if (
      !roleToApply.whitelistedusers?.includes(msg.author.id) &&
      roleToApply.whitelistedusers?.length
    ) {
      return { noRoles: false, finished: false };
    }

    if (
      !msg.member?.roles.some((r) => roleToApply.whitelistedroles?.includes(r)) &&
      roleToApply.whitelistedroles?.length
    ) {
      return { noRoles: false, finished: false };
    }

    if (roleToApply.blacklistedusers?.includes(msg.author.id)) {
      return { noRoles: false, finished: false };
    }
    if (roleToApply.blacklistedroles?.some((r) => msg.member?.roles.includes(r))) {
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
  if (!msg.guildID) return true;

  const perms = new Eris.Permission(command.perm);
  if (!msg.guild) return true;

  if (command.type === 'mod') {
    const modRoles = await getModRoles();

    if (modRoles) {
      const { noRoles, finished } = await checkModRoles(modRoles);
      if (!noRoles && !finished) {
        client.ch.error(
          msg as Eris.Message,
          msg.language.commands.commandHandler.modRoleError,
          msg.language,
        );
        return false;
      }

      if (finished === true) return false;
    }
  }

  if (!msg.member?.permissions.has(BigInt(command.perm))) {
    client.ch.permError(msg as Eris.Message, command.perm, msg.language, false);
    return false;
  }

  if (!msg.guild.members.get(client.user.id)?.permissions.has(perms.allow)) {
    client.ch.permError(msg as Eris.Message, perms.allow, msg.language, true);
    return false;
  }

  return true;
};

type clEntry = { job: jobs.Job; channel: Eris.Channel; expire: number; command: CT.Command };
const cooldowns: clEntry[] = [];

const getCooldown = async (msg: CT.Message, command: CT.Command) => {
  if (!msg.guildID) return false;

  const onCooldown = (cl: clEntry) => {
    const getEmote = (secondsLeft: number) => {
      let returned = `**${moment
        .duration(secondsLeft * 1000)
        .format(`s [${msg.language.time.seconds}]`, { trim: 'all' })}**`;
      let usedEmote = false;

      if (secondsLeft <= 60) {
        returned = `${client.stringEmotes.timers[secondsLeft]} **${msg.language.time.seconds}**`;
        usedEmote = true;
      }

      return { emote: returned, usedEmote };
    };

    const timeLeft = cl.expire - Date.now();
    const { emote, usedEmote } = getEmote(Math.ceil(timeLeft / 1000));

    client.ch
      .reply(
        msg,
        {
          content: client.ch.stp(msg.language.commands.commandHandler.pleaseWait, {
            time: emote,
          }),
        },
        msg.language,
      )
      .then((m) => {
        if (!usedEmote && m) {
          jobs.scheduleJob(new Date(Date.now() + (timeLeft - 60000)), () => {
            m
              .edit({
                content: client.ch.stp(msg.language.commands.commandHandler.pleaseWait, {
                  time: client.stringEmotes.timers[60],
                }),
              })
              .catch(() => null);
          });
        }

        jobs.scheduleJob(new Date(cl.expire), () => {
          m?.delete().catch(() => null);
          msg.delete().catch(() => null);
        });
      });
  };

  const getCooldownRows = async () =>
    client.ch
      .query(`SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2;`, [
        msg.guildID,
        command.name,
      ])
      .then((r: DBT.cooldowns[] | null) => r || null);

  const rows = await getCooldownRows();
  if (!rows) return false;

  const applyingRows = rows.filter(
    (row) =>
      (!row.activechannelid?.length || row.activechannelid?.includes(msg.channel.id)) &&
      !row.bpchannelid?.includes(msg.channel.id) &&
      !row.bpuserid?.includes(msg.author.id) &&
      !row.bproleid?.some((r) => msg.member?.roles.includes(r)),
  );

  const applyingCooldown = Math.max(...applyingRows.map((r) => Number(r.cooldown) * 1000));
  command.cooldown = applyingCooldown;

  if (msg.author.id !== auth.ownerID) {
    const cl = cooldowns.find(
      (c) => c.command.name === command.name && c.channel.id === msg.channel.id,
    );
    if (cl?.channel.id === msg.channel.id) {
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
    channel: msg.channel,
    command,
    expire,
  });

  return false;
};

const commandExe = async (msg: CT.Message, command: CT.Command, triedCMD?: unknown) => {
  const lan = msg.language.commands[command.name as keyof typeof msg.language.commands];

  try {
    // eslint-disable-next-line no-console
    console.log(`[Command Executed] ${command.name} | ${msg.jumpLink}`);
    command.execute(msg, { language: msg.language, lan }, command, { triedCMD });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[Command Error] ${command.name}:`, e);
  }
};

const editCheck = async (msg: CT.Message, command: CT.Command) => {
  if (!msg.editedTimestamp) return true;
  if (command.type !== 'mod') return true;

  const editVerifier = async () => {
    const buttons: Eris.Button[] = [
      {
        custom_id: 'proceed',
        label: msg.language.mod.warning.proceed,
        style: 4,
        emoji: client.objectEmotes.warning,
        type: 2,
      },
      {
        custom_id: 'abort',
        label: msg.language.mod.warning.abort,
        style: 2,
        emoji: client.objectEmotes.cross,
        type: 2,
      },
    ];

    const m = await client.ch.reply(
      msg,
      {
        content: msg.language.commands.commandHandler.verifyMessage,
        components: client.ch.buttonRower(buttons),
      },
      msg.language,
    );

    if (!m) return false;

    const buttonsCollector = new InteractionCollector(m as Eris.Message);

    return new Promise((resolve) => {
      buttonsCollector.on('collect', (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          client.ch.notYours(interaction, msg.language);
          resolve(false);
          return;
        }

        buttonsCollector.stop();

        if (interaction.customId === 'abort') {
          m.delete().catch(() => null);
          msg.delete().catch(() => null);
          interaction.deferUpdate().catch(() => null);
          resolve(false);
          return;
        }

        if (interaction.customId === 'proceed') {
          interaction.deferUpdate().catch(() => null);
          resolve(true);
        }
      });

      buttonsCollector.on('end', (reason) => {
        if (reason === 'time') {
          m.delete().catch(() => null);
          msg.delete().catch(() => null);
          resolve(false);
        }
      });
    });
  };

  const proceed = await editVerifier();
  if (!proceed) return false;

  return true;
};
