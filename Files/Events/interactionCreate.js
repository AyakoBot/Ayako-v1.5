const Builders = require('@discordjs/builders');
const Discord = require('discord.js');
const jobs = require('node-schedule');
const moment = require('moment');
require('moment-duration-format');
const auth = require('../BaseClient/auth.json');

const cooldowns = new Map();
const nonSlashCommandCooldowns = new Map();

module.exports = {
  execute: async (interaction) => {
    if (!interaction.user) return;

    otherInteractionHandler(interaction);
    slashCommandHandler(interaction);
  },
};

const otherInteractionHandler = async (interaction) => {
  const { args, nonSlashCommand } = getInteraction(interaction);
  if (!nonSlashCommand) return;

  if (nonSlashCommand.cooldown) {
    if (nonSlashCommandCooldowns.has(interaction.user.id)) {
      const timeleft = Math.abs(nonSlashCommandCooldowns.get(interaction.user.id) - Date.now());

      interaction.client.ch.reply(interaction, {
        content: interaction.client.ch.stp(
          interaction.language.commands.commandHandler.pleaseWait,
          {
            time: `${Math.ceil(timeleft / 1000)} ${interaction.language.time.seconds}`,
          },
        ),
        ephemeral: true,
      });
      return;
    }
    nonSlashCommandCooldowns.set(interaction.user.id, Date.now());
    jobs.scheduleJob(new Date(Date.now() + nonSlashCommand.cooldown), () => {
      nonSlashCommandCooldowns.delete(interaction.user.id);
    });
  }

  if (nonSlashCommand.needsLanguage) {
    interaction.language = await interaction.client.ch.languageSelector(interaction.guild);
  }

  if (args && args.length) args.shift();
  interaction.args = args;

  try {
    nonSlashCommand.execute(interaction, interaction.language);
  } catch (e) {
    error(interaction, e);
  }
};

const getInteraction = (interaction) => {
  const nonSlashCommand = interaction.client.nonSlashCommands.find(
    (cmd) =>
      cmd.name === (cmd.split ? interaction.customId?.split(cmd.split)[0] : interaction.customId),
  );

  if (!nonSlashCommand) return { args: [], nonSlashCommand: null };

  const args = nonSlashCommand.split
    ? interaction.customId.split(nonSlashCommand.split)
    : [interaction.customId];

  return { args, nonSlashCommand };
};

const slashCommandHandler = async (interaction) => {
  interaction.cmd =
    interaction.client.slashCommands.get(interaction.customId) ||
    interaction.client.slashCommands.find((c) => c.name === interaction.commandName);

  if (!interaction.cmd) return;
  interaction.language = await interaction.client.ch.languageSelector(interaction.guild);

  if (
    interaction.cmd.thisGuildOnly &&
    !interaction.cmd.thisGuildOnly.includes(interaction.guild?.id)
  ) {
    return;
  }

  if (interaction.cmd.perm === 0) {
    if (interaction.user.id !== auth.ownerID) {
      interaction.client.ch.error(
        interaction,
        interaction.language.commands.commandHandler.creatorOnly,
      );
      return;
    }
    editCheck(interaction);
    return;
  }
  if (interaction.cmd.perm === 1) {
    if (interaction.guild?.ownerId !== interaction.user.id) {
      interaction.client.ch.error(
        interaction,
        interaction.language.commands.commandHandler.ownerOnly,
      );
      return;
    }
    editCheck(interaction);
    return;
  }

  if (interaction.channel.type === 1) {
    runDMCommand(interaction);
    return;
  }
  if (interaction.cmd.dmOnly) {
    interaction.channel.ch.error(interaction, interaction.language.commands.commandHandler.dmOnly);
    return;
  }

  if (interaction.user.id === interaction.client.constants.standard.ownerID) {
    editCheck(interaction);
    return;
  }

  const disabledCommands = await getDisabledRes(interaction);
  if (disabledCommands && disabledCommands.length) {
    const finished = checkDisabled(interaction, disabledCommands);
    if (finished) return;
  }

  if (typeof interaction.cmd.perm === 'bigint') {
    const perms = new Discord.PermissionsBitField(interaction.cmd.perm);

    if (interaction.cmd.type === 'mod') {
      const modRoles = await getModRoles(interaction);

      const finished = await checkModRoles(interaction, modRoles);
      if (finished !== 'noRoles' && !finished) {
        interaction.client.ch.error(
          interaction,
          interaction.language.commands.commandHandler.modRoleError,
        );
        return;
      }

      if (finished === true) return;
    }

    if (!interaction.member.permissions.has(interaction.cmd.perm)) {
      interaction.client.ch.permError(interaction, interaction.cmd.perm, false);
      return;
    }

    if (!interaction.guild.me.permissions.has(perms)) {
      interaction.client.ch.permError(interaction, perms, true);
      return;
    }
  }
  editCheck(interaction);
};

const error = (interaction, e) => {
  // eslint-disable-next-line no-console
  console.log(e);

  const channel = interaction.client.channels.cache.get(interaction.client.constants.errorchannel);

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: 'Interaction Error',
      iconURL: interaction.client.objectEmotes.cross.link,
      url: interaction.url,
    })
    .setTimestamp()
    .setDescription(`${interaction.client.ch.makeCodeBlock(e.stack)}`)
    .addFields({
      name: 'Message',
      value: `${interaction.client.ch.makeCodeBlock(interaction)}`,
    })
    .addFields({
      name: 'Guild',
      value: `${interaction.guild?.name} | ${interaction.guild?.id}`,
    })
    .addFields({
      name: 'Channel',
      value: `${interaction.channel?.name} | ${interaction.channel?.id}`,
    })
    .addFields({ name: 'Message Link', value: interaction.url })
    .setColor(16711680);
  if (channel) interaction.client.ch.send(channel, { embeds: [embed] });
};

const checkDisabled = (interaction, disabledCommands) => {
  const applyingRows = disabledCommands.filter(
    (row) =>
      row.commands.includes(interaction.cmd.name) ||
      (interaction.cmd.aliases &&
        interaction.cmd.aliases.some((alias) => row.commands.includes(alias))),
  );

  if (!applyingRows || !applyingRows.length) return false;

  const isEnabled = applyingRows.map((row) => {
    if (row.bpuserid?.length && !row.bpuserid.includes(interaction.user.id)) return false;

    if (row.channel?.length && !row.channel.includes(interaction.channel.id)) return false;

    if (row.bluserid?.length && row.bluserid.includes(interaction.user.id)) return false;

    if (row.blroleid?.length && row.blroleid.some((r) => interaction.member.roles.cache.has(r))) {
      return false;
    }

    if (row.bproleid?.length && !row.bproleid.some((r) => interaction.member.roles.cache.has(r))) {
      return false;
    }

    return true;
  });

  if (isEnabled.includes(false)) {
    return true;
  }
  return false;
};

const editCheck = async (interaction) => {
  const cooldownRes = await getCooldown(interaction);
  interaction.cooldown = cooldownRes.cooldown || interaction.cmd.cooldown;

  if (interaction.user.id === auth.ownerID) {
    const proceed = ownerExecute(interaction);
    if (!proceed) return;
  } else if (
    cooldowns.get(interaction.cmd.name) &&
    cooldowns.get(interaction.cmd.name).channel.id === interaction.channel.id
  ) {
    onCooldown(interaction);
    return;
  } else if (checkCooldownConfig(interaction, cooldownRes) || interaction.cooldown) {
    putCooldown(interaction);
  }

  commandExe(interaction);
};

const getDisabledRes = async (interaction) => {
  const res = await interaction.client.ch.query(
    'SELECT * FROM disabledcommands WHERE guildid = $1 AND active = true;',
    [interaction.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return null;
};

const checkModRoles = async (interaction, modRoles) => {
  const applyingRows = modRoles
    ? modRoles.filter((row) => interaction.member.roles.cache.has(row.roleid))
    : [];
  if (!applyingRows || !applyingRows.length) return 'noRoles';
  const [roleToApply] = applyingRows.sort(
    (a, b) =>
      interaction.guild.roles.cache.get(b.roleid).rawPosition -
      interaction.guild.roles.cache.get(a.roleid).rawPosition,
  );

  if (
    !roleToApply.whitelistedusers?.includes(interaction.user.id) &&
    roleToApply.whitelistedusers?.length
  ) {
    return false;
  }

  if (
    !interaction.member.roles.cache.some((r) => roleToApply.whitelistedroles?.includes(r.id)) &&
    roleToApply.whitelistedroles?.length
  ) {
    return false;
  }

  if (roleToApply.blacklistedusers?.includes(interaction.user.id)) {
    return false;
  }
  if (roleToApply.blacklistedroles?.some((r) => interaction.member.roles.cache.has(r))) {
    return false;
  }

  if (
    (!roleToApply.perms ||
      !new Discord.PermissionsBitField(roleToApply.perms).has(interaction.cmd.perm) ||
      !roleToApply.blacklistedcommands ||
      roleToApply.blacklistedcommands.includes(interaction.cmd.name)) &&
    roleToApply.whitelistedcommands &&
    !roleToApply.whitelistedcommands.includes(interaction.cmd.name)
  ) {
    return false;
  }

  editCheck(interaction);
  interaction.member.modrole = roleToApply;

  return true;
};

const getModRoles = async (interaction) => {
  const res = await interaction.client.ch.query(
    'SELECT * FROM modroles WHERE guildid = $1 AND active = true;',
    [interaction.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return null;
};

const putCooldown = (interaction) => {
  cooldowns.set(interaction.cmd.name, {
    job: jobs.scheduleJob(new Date(Date.now() + interaction.cooldown), () => {
      cooldowns.delete(interaction.cmd.name);
    }),
    channel: interaction.channel,
    expire: Date.now() + Number(interaction.cooldown),
  });
};

const checkCooldownConfig = (interaction, res) =>
  res &&
  !res.bpuserid?.includes(interaction.user.id) &&
  !res.bpchannelid?.includes(interaction.channel.id) &&
  !res.bproleid?.some((id) => interaction.member.roles.cache.has(id)) &&
  (!res.activechannelid?.length || !res.activechannelid.includes(interaction.channel.id));

const getCooldown = async (interaction) => {
  const res = await interaction.client.ch.query(
    `SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2;`,
    [interaction.guild.id, interaction.cmd.name],
  );

  if (res && res.rowCount) {
    res.rows[0].cooldown = Number(res.rows[0].cooldown) * 1000;
    return res.rows[0];
  }
  return { cooldown: 0 };
};

const ownerExecute = (interaction) => {
  if (interaction.cmd.name === 'eval') {
    interaction.cmd.execute(interaction);
    return false;
  }

  cooldowns.get(interaction.cmd.name)?.job.cancel();
  cooldowns.set(interaction.cmd.name, {
    job: jobs.scheduleJob(new Date(Date.now() + interaction.cooldown), () => {
      cooldowns.delete(interaction.cmd.name);
    }),
    channel: interaction.channel,
    expire: Date.now() + Number(interaction.cooldown),
  });
  return true;
};

const onCooldown = (interaction) => {
  const cl = cooldowns.get(interaction.cmd.name);

  const timeLeft = Math.abs(Number(cl.expire) - Date.now());

  interaction.cooldown = undefined;
  interaction.client.ch.reply(interaction, {
    content: interaction.client.ch.stp(interaction.language.commands.commandHandler.pleaseWait, {
      time: `${Math.ceil(timeLeft / 1000)} ${interaction.language.time.seconds}`,
    }),
    ephemeral: true,
  });
};

const commandExe = async (interaction) => {
  if (interaction.channel.type !== 1) await doLogChannels(interaction);

  interaction.lan = interaction.language.slashCommands[interaction.cmd.name];

  try {
    if (interaction.client.user.id === interaction.client.mainID) {
      const statcord = require('../BaseClient/Statcord');
      statcord.postCommand(interaction.cmd.name, interaction.user.id).catch(() => {});
    }

    // eslint-disable-next-line no-console
    console.log(`Slash-Command executed: ${interaction.cmd.name} | ${interaction.channel.id}`);
    interaction.cmd.execute(interaction, interaction.language);
  } catch (e) {
    const channel = interaction.client.channels.cache.get(
      interaction.client.constants.errorchannel,
    );

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: 'Command Error',
        iconURL: interaction.client.objectEmotes.cross.link,
        url: interaction.url,
      })
      .setTimestamp()
      .setDescription(`${interaction.client.ch.makeCodeBlock(e.stack)}`)
      .addFields({ name: 'Message', value: `${interaction.client.ch.makeCodeBlock(interaction)}` })
      .addFields({ name: 'Guild', value: `${interaction.guild?.name} | ${interaction.guild?.id}` })
      .addFields({
        name: 'Channel',
        value: `${interaction.channel?.name} | ${interaction.channel?.id}`,
      })
      .addFields({ name: 'Message Link', value: interaction.url })
      .setColor(16711680);

    if (channel) interaction.client.ch.send(channel, { embeds: [embed] });
  }
};

const doLogChannels = async (interaction) => {
  const res = await interaction.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
    interaction.guild.id,
  ]);

  if (!res || !res.rowCount) return;

  interaction.logchannels = res.rows[0].modlogs
    ?.map((id) =>
      typeof interaction.client.channels.cache.get(id)?.send === 'function'
        ? interaction.client.channels.cache.get(id)
        : null,
    )
    .filter((c) => c !== null);
  if (!interaction.logchannels) interaction.logchannels = [];
};

const runDMCommand = (interaction) => {
  if (interaction.cmd.dm) commandExe(interaction);
  else {
    interaction.client.ch.error(
      interaction,
      interaction.language.commands.commandHandler.GuildOnly,
    );
  }
};
