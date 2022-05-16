const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');
const fs = require('fs');
const moment = require('moment');
require('moment-duration-format');

const auth = require('../../../BaseClient/auth.json');

const cooldowns = new Discord.Collection();

module.exports = {
  prefix: async (msg) => {
    const getCustomPrefix = async () => {
      const res = await msg.client.ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res && res.rowCount > 0) return res.rows[0].prefix;
      return null;
    };

    const prefixStandard = msg.client.constants.standard.prefix;
    let prefix;
    let prefixCustom;

    if (msg.channel.type !== 1 && msg.guild) {
      prefixCustom = await getCustomPrefix();
    }

    if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
    else if (msg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
    else return [];

    if (!prefix) return [];

    msg.args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);
    msg.command = getCommand(msg);
    if (!msg.command) return [];
    msg.language = await msg.client.ch.languageSelector(msg.guild);
    msg.lan = msg.language.commands[`${msg.command.name}`];
    return [msg, prefix];
  },

  execute: async (rawmsg) => {
    if (rawmsg.author.id === '318453143476371456') console.log(1);
    const [msg] = await module.exports.prefix(rawmsg);
    if (!msg) return;
    if (msg.command?.thisGuildOnly && msg.command?.thisGuildOnly.includes(msg.guild?.id)) return;

    if (msg.command.perm === 0) {
      if (msg.author.id !== auth.ownerID) {
        msg.client.ch.error(msg, msg.language.commands.commandHandler.creatorOnly);
        return;
      }
      editCheck(msg);
      return;
    }
    if (msg.command.perm === 1) {
      if (msg.guild?.ownerId !== msg.author.id) {
        msg.client.ch.error(msg, msg.language.commands.commandHandler.ownerOnly);
        return;
      }
      editCheck(msg);
      return;
    }

    if (msg.channel.type === 1) {
      runDMCommand(msg);
      return;
    }
    if (msg.command.dmOnly) {
      msg.channel.ch.error(msg, msg.language.commands.commandHandler.dmOnly);
      msg.delete().catch(() => {});
      return;
    }

    if (msg.author.id === msg.client.constants.standard.ownerID) {
      editCheck(msg);
      return;
    }

    const disabledCommands = await getDisabledRes(msg);
    if (disabledCommands && disabledCommands.length) {
      const disabled = checkDisabled(msg, disabledCommands);
      if (disabled) return;
    }

    if (typeof msg.command.perm === 'bigint') {
      const perms = new Discord.PermissionsBitField(msg.command.perm);

      if (msg.command.type === 'mod') {
        const modRoles = await getModRoles(msg);

        const finished = await checkModRoles(msg, modRoles);
        if (finished !== 'noRoles' && !finished) {
          msg.client.ch.error(msg, msg.language.commands.commandHandler.modRoleError);
          return;
        }

        if (finished === true) return;
      }

      if (!msg.member.permissions.has(msg.command.perm)) {
        msg.client.ch.permError(msg, msg.command.perm, false);
        return;
      }

      if (!msg.guild.members.me.permissions.has(perms)) {
        msg.client.ch.permError(msg, perms, true);
        return;
      }
    }
    editCheck(msg);
  },
};

const checkDisabled = (msg, disabledCommands) => {
  const applyingRows = disabledCommands.filter(
    (row) =>
      (row.commands?.includes(msg.command.name) ||
        (msg.command.aliases &&
          msg.command.aliases.some((alias) => row.commands?.includes(alias)))) &&
      row.channels?.includes(msg.channel.id),
  );

  if (!applyingRows || !applyingRows.length) return false;

  const isDisabled = applyingRows.map((row) => {
    if (row.bpuserid?.length && !row.bpuserid.includes(msg.author.id)) return false;

    if (row.channel?.length && !row.channel.includes(msg.channel.id)) return false;

    if (row.bluserid?.length && row.bluserid.includes(msg.author.id)) return false;

    if (row.blroleid?.length && row.blroleid.some((r) => msg.member.roles.cache.has(r))) {
      return false;
    }

    if (row.bproleid?.length && !row.bproleid.some((r) => msg.member.roles.cache.has(r))) {
      return false;
    }

    return true;
  });

  return isDisabled.includes(true);
};

const editCheck = async (msg) => {
  if (msg.channel.type === 1) {
    runDMCommand(msg);
    return;
  }
  const cooldownRes = await getCooldown(msg);
  msg.cooldown = cooldownRes.cooldown;

  if (msg.author.id === auth.ownerID) {
    const proceed = ownerExecute(msg);
    if (!proceed) return;
  } else if (
    cooldowns.get(msg.command.name) &&
    cooldowns.get(msg.command.name).channel.id === msg.channel.id
  ) {
    onCooldown(msg);
    return;
  } else if (checkCooldownConfig(msg, cooldownRes)) {
    putCooldown(msg);
  }

  if (msg.editedTimestamp) {
    if (msg.command.type === 'mod') {
      const proceed = await editVerifier(msg);
      if (!proceed) return;
    }
  }
  commandExe(msg);
};

const getDisabledRes = async (msg) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM disabledcommands WHERE guildid = $1 AND active = true;',
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return null;
};

const checkModRoles = async (msg, modRoles) => {
  const applyingRows = modRoles
    ? modRoles.filter((row) => msg.member.roles.cache.has(row.roleid))
    : [];
  if (!applyingRows || !applyingRows.length) return 'noRoles';
  const [roleToApply] = applyingRows.sort(
    (a, b) =>
      msg.guild.roles.cache.get(b.roleid).rawPosition -
      msg.guild.roles.cache.get(a.roleid).rawPosition,
  );

  if (
    !roleToApply.whitelistedusers?.includes(msg.author.id) &&
    roleToApply.whitelistedusers?.length
  ) {
    return false;
  }

  if (
    !msg.member.roles.cache.some((r) => roleToApply.whitelistedroles?.includes(r.id)) &&
    roleToApply.whitelistedroles?.length
  ) {
    return false;
  }

  if (roleToApply.blacklistedusers?.includes(msg.author.id)) {
    return false;
  }
  if (roleToApply.blacklistedroles?.some((r) => msg.member.roles.cache.has(r))) {
    return false;
  }

  if (
    (!roleToApply.perms ||
      !new Discord.PermissionsBitField(roleToApply.perms).has(msg.command.perm) ||
      !roleToApply.blacklistedcommands ||
      roleToApply.blacklistedcommands.includes(msg.command.name)) &&
    roleToApply.whitelistedcommands &&
    !roleToApply.whitelistedcommands.includes(msg.command.name)
  ) {
    return false;
  }

  editCheck(msg);
  msg.member.modrole = roleToApply;

  return true;
};

const getModRoles = async (msg) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM modroles WHERE guildid = $1 AND active = true;',
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return null;
};

const putCooldown = (msg) => {
  cooldowns.set(msg.command.name, {
    job: jobs.scheduleJob(new Date(Date.now() + msg.cooldown), () => {
      cooldowns.delete(msg.command.name);
    }),
    channel: msg.channel,
    expire: Date.now() + msg.cooldown,
  });
};

const checkCooldownConfig = (msg, res) =>
  res &&
  !res.bpuserid?.includes(msg.author.id) &&
  !res.bpchannelid?.includes(msg.channel.id) &&
  !res.bproleid?.some((id) => msg.member.roles.cache.has(id)) &&
  (!res.activechannelid?.length || !res.activechannelid.includes(msg.channel.id));

const getCooldown = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2;`,
    [msg.guild.id, msg.command.name],
  );

  if (res && res.rowCount) {
    res.rows[0].cooldown = Number(res.rows[0].cooldown) * 1000;
    return res.rows[0];
  }
  return { cooldown: 1000 };
};

const ownerExecute = (msg) => {
  if (msg.command.name === 'eval') {
    msg.command.execute(msg);
    return false;
  }

  cooldowns.get(msg.command.name)?.job.cancel();
  cooldowns.set(msg.command.name, {
    job: jobs.scheduleJob(new Date(Date.now() + msg.cooldown), () => {
      cooldowns.delete(msg.command.name);
    }),
    channel: msg.channel,
    expire: Date.now() + msg.cooldown,
  });
  return true;
};

const onCooldown = (msg) => {
  const cl = cooldowns.get(msg.command.name);

  const timeLeft = cl.expire - Date.now();
  const { emote, usedEmote } = getEmote(Math.ceil(timeLeft / 1000), msg);

  msg.cooldown = undefined;
  msg.client.ch
    .reply(msg, {
      content: msg.client.ch.stp(msg.language.commands.commandHandler.pleaseWait, {
        time: emote,
      }),
    })
    .then((m) => {
      if (!usedEmote) {
        jobs.scheduleJob(new Date(Date.now() + (timeLeft - 60000)), () => {
          msg.client.ch
            .edit(m, {
              content: msg.client.ch.stp(msg.language.commands.commandHandler.pleaseWait, {
                time: msg.client.textEmotes.timers[60],
              }),
            })
            .catch(() => {});
        });
      }

      jobs.scheduleJob(new Date(cl.expire), () => {
        m.delete().catch(() => {});
        msg.delete().catch(() => {});
      });
    });
};

const getEmote = (secondsLeft, msg) => {
  let returned = `**${moment
    .duration(secondsLeft * 1000)
    .format(`s [${msg.language.time.seconds}]`)}**`;
  let usedEmote = false;

  if (secondsLeft <= 60) {
    returned = `${msg.client.textEmotes.timers[secondsLeft]} **${msg.language.time.seconds}**`;
    usedEmote = true;
  }

  return { emote: returned, usedEmote };
};

const editVerifier = async (msg) => {
  const buttons = [
    new Builders.UnsafeButtonBuilder()
      .setCustomId('proceed')
      .setLabel(msg.language.mod.warning.proceed)
      .setStyle(Discord.ButtonStyle.Danger)
      .setEmoji(msg.client.objectEmotes.warning),
    new Builders.UnsafeButtonBuilder()
      .setCustomId('abort')
      .setLabel(msg.language.mod.warning.abort)
      .setStyle(Discord.ButtonStyle.Secondary)
      .setEmoji(msg.client.objectEmotes.cross),
  ];

  const m = await msg.client.ch.reply(msg, {
    content: msg.language.commands.commandHandler.verifyMessgae,
    components: msg.client.ch.buttonRower([buttons]),
  });

  const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });

  return new Promise((resolve) => {
    buttonsCollector.on('collect', (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction);
        resolve(false);
        return;
      }

      buttonsCollector.stop();

      if (interaction.customId === 'abort') {
        m.delete().catch(() => {});
        msg.delete().catch(() => {});
        interaction.deferUpdate().catch(() => {});
        resolve(false);
        return;
      }

      if (interaction.customId === 'proceed') {
        interaction.deferUpdate().catch(() => {});
        resolve(true);
      }
    });

    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        m.delete().catch(() => {});
        msg.delete().catch(() => {});
        resolve(false);
      }
    });
  });
};

const commandExe = async (msg) => {
  if (msg.channel.type !== 1) await doLogChannels(msg);

  try {
    if (msg.client.user.id === msg.client.mainID) {
      const statcord = require('../../../BaseClient/Statcord');
      statcord.postCommand(msg.command.name, msg.author.id).catch(() => {});
    }

    // eslint-disable-next-line no-console
    console.log(`Command executed: ${msg.command.name} | ${msg.url}`);
    msg.command.execute(msg);
  } catch (e) {
    const channel = msg.client.channels.cache.get(msg.client.constants.errorchannel);

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: 'Command Error',
        iconURL: msg.client.objectEmotes.cross.link,
        url: msg.url,
      })
      .setTimestamp()
      .setDescription(`${msg.client.ch.makeCodeBlock(e.stack)}`)
      .addFields({ name: 'Message', value: `${msg.client.ch.makeCodeBlock(msg)}` })
      .addFields({ name: 'Guild', value: `${msg.guild?.name} | ${msg.guild?.id}` })
      .addFields({ name: 'Channel', value: `${msg.channel?.name} | ${msg.channel?.id}` })
      .addFields({ name: 'Message Link', value: msg.url })
      .setColor(16711680);

    if (channel) msg.client.ch.send(channel, { embeds: [embed] });
  }
};

const doLogChannels = async (msg) => {
  const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
    msg.guild.id,
  ]);

  if (!res || !res.rowCount) return;

  msg.logchannels = res.rows[0].modlogs
    ?.map((id) =>
      typeof msg.client.channels.cache.get(id)?.send === 'function'
        ? msg.client.channels.cache.get(id)
        : null,
    )
    .filter((c) => c !== null);
  if (!msg.logchannels) msg.logchannels = [];
};

const runDMCommand = (msg) => {
  if (msg.command.dm) {
    if (msg.command.takesFirstArg && !msg.args[0]) {
      msg.triedCMD = msg.command;
      msg.command = require(`${require.main.path}/Files/Commands/cmdhelp`);
    }
    commandExe(msg);
  } else msg.client.ch.error(msg, msg.language.commands.commandHandler.GuildOnly);
};

const getCommand = (msg) => {
  const dir = `${require.main.path}/Files/Commands`;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  const searchedFileName = msg.args.shift().toLowerCase();

  const file = files
    .map((c) => {
      const possibleFile = require(`${dir}/${c}`);
      if (
        possibleFile.name === searchedFileName ||
        possibleFile.aliases?.includes(searchedFileName)
      ) {
        if (possibleFile.takesFirstArg && !msg.args[0]) {
          msg.triedCMD = possibleFile;
          return require(`${dir}/cmdhelp`);
        }
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)[0];

  return file;
};
