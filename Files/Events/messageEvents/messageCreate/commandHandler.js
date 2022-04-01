// TODO: assing msg.member.modrole;
const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');
const moment = require('moment');
require('moment-duration-format');

const auth = require('../../../BaseClient/auth.json');

const cooldowns = new Discord.Collection();

module.exports = {
  async prefix(msg) {
    const Constants = msg.client.constants;
    const { ch } = msg.client;
    let prefix;
    const prefixStandard = Constants.standard.prefix;
    let prefixCustom;
    if (msg.channel.type !== 1 && msg.guild) {
      const res = await ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
      if (res && res.rowCount > 0) prefixCustom = res.rows[0].prefix;
    }
    if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
    else if (msg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
    else return;
    if (!prefix) return;
    msg.language = await msg.client.ch.languageSelector(msg.guild);
    const args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command =
      msg.client.commands.get(commandName) ||
      msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (command.takesFirstArg && !args[0]) {
      msg.triedCMD = command;
      command = msg.client.commands.get('cmdhelp');
    }
    msg.lan = msg.language.commands[`${command.name}`];
    msg.args = args;
    msg.command = command;
    // eslint-disable-next-line consistent-return
    return [msg, prefix];
  },
  async execute(rawmsg) {
    let msg = await this.prefix(rawmsg);
    if (!msg) return;
    [msg] = msg;
    if (msg.channel.type === 1) {
      this.DMcommand(msg);
      return;
    }
    if (msg.command.dmOnly) {
      msg.channel.send(msg.language.commands.dmOnly);
      msg.delete().catch(() => {});
      return;
    }

    const cooldownRes = await getCooldown(msg);
    msg.cooldown = cooldownRes.cooldown;

    if (msg.author.id === auth.ownerID) {
      if (msg.command.name === 'eval') {
        msg.command.execute(msg);
        return;
      }

      cooldowns.get(msg.command.name)?.job.cancel();
      cooldowns.set(msg.command.name, {
        job: jobs.scheduleJob(new Date(Date.now() + cooldownRes.cooldown), () => {
          cooldowns.delete(msg.command.name);
        }),
        channel: msg.channel,
        expire: Date.now() + cooldownRes.cooldown,
      });
    } else if (
      cooldowns.get(msg.command.name) &&
      cooldowns.get(msg.command.name).channel.id === msg.channel.id
    ) {
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
              m.edit({
                content: msg.client.ch.stp(msg.language.commands.commandHandler.pleaseWait, {
                  time: msg.client.textEmotes.timers[60],
                }),
              }).catch(() => {});
            });
          }

          jobs.scheduleJob(new Date(cl.expire), () => {
            m.delete().catch(() => {});
            msg.delete().catch(() => {});
          });
        });
      return;
    } else if (
      !cooldownRes?.bpuserid?.includes(msg.author.id) &&
      !cooldownRes?.bpchannelid?.includes(msg.channel.id) &&
      !cooldownRes?.bproleid?.some((id) => msg.member.roles.cache.has(id)) &&
      (!cooldownRes?.activechannelid?.length ||
        !cooldownRes?.activechannelid.includes(msg.channel.id))
    ) {
      cooldowns.set(msg.command.name, {
        job: jobs.scheduleJob(new Date(Date.now() + cooldownRes.cooldown), () => {
          cooldowns.delete(msg.command.name);
        }),
        channel: msg.channel,
        expire: Date.now() + cooldownRes.cooldown,
      });
    }
    this.thisGuildOnly(msg);
  },
  async thisGuildOnly(msg) {
    if (msg.command.thisGuildOnly && !msg.command.thisGuildOnly.includes(msg.guild.id)) return;
    this.commandCheck(msg);
  },
  async commandCheck(msg) {
    // const res = await msg.client.ch.query('SELECT * FROM disabledcommands WHERE guildid = $1;', [msg.guild.id]);
    // if (res && res.rowCount > 0 && res.rows[0].disabled.includes(msg.command.name.toLowerCase())) return msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.CommandDisabled, {name: msg.command.name}));
    this.permissionCheck(msg);
  },
  async permissionCheck(msg) {
    const perms =
      typeof msg.command.perm === 'bigint'
        ? new Discord.PermissionsBitField(msg.command.perm)
        : undefined;
    if (perms && !msg.guild.me.permissions.has(perms)) {
      return msg.client.ch.permError(msg, perms, true);
    }
    if (msg.command.perm === 0) {
      if (msg.author.id !== auth.ownerID) {
        return msg.client.ch.reply(msg, msg.language.commands.commandHandler.creatorOnly);
      }
      return this.editCheck(msg);
    }
    if (msg.command.perm === 1) {
      if (msg.guild.ownerID !== msg.author.id) {
        return msg.client.ch.reply(msg, msg.language.commands.commandHandler.ownerOnly);
      }
      return this.editCheck(msg);
    }
    if (typeof msg.command.perm === 'bigint') {
      const names = [];
      msg.client.commands.each((command) => {
        if (command.type === 'mod') names.push(command.name);
      });
      if (names.includes(msg.command.name)) {
        const res = await msg.client.ch.query('SELECT * FROM modroles WHERE guildid = $1;', [
          msg.guild.id,
        ]);
        if (res && res.rowCount > 0) {
          const roles = [];
          res.rows.forEach((r) => roles.push(r.roleid));
          if (msg.member.roles.cache.some((r) => roles.includes(r.id))) return this.editCheck(msg);
          if (!msg.member.permissions.has(msg.command.perm)) {
            return msg.client.ch.reply(
              msg,
              msg.language.commands.commandHandler.missingPermissions,
            );
          }
        } else if (!msg.member.permissions.has(msg.command.perm)) {
          return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
        }
      } else if (!msg.member.permissions.has(msg.command.perm)) {
        return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
      }
    }
    return this.editCheck(msg);
  },
  async editCheck(msg) {
    if (msg.editedTimestamp) {
      if (msg.command.category === 'Moderation') this.editVerifier(msg);
      else this.commandExe(msg);
    } else this.commandExe(msg);
  },
  async editVerifier(msg) {
    const m = await msg.client.ch.reply(
      msg,
      msg.client.language.commands.commandHandler.verifyMessgae,
    );
    m.react(msg.client.objectEmotes.tick.id).catch(() => {});
    m.react(msg.client.objectEmotes.cross.id).catch(() => {});
    msg.channel
      .awaitMessages((me) => me.author.id === msg.author.id, { max: 1, time: 30000 })
      .then((rawcollected) => {
        if (!rawcollected.first()) return;
        if (
          rawcollected.first().content.toLowerCase() === 'y' ||
          rawcollected.first().content.toLowerCase() === 'yes' ||
          rawcollected.first().content.toLowerCase() === 'proceed' ||
          rawcollected.first().content.toLowerCase() === 'continue' ||
          rawcollected.first().content.toLowerCase() === 'go'
        ) {
          if (m.deleted === false) {
            rawcollected
              .first()
              .delete()
              .catch(() => {});
            m.delete().catch(() => {});
            this.commandExe(msg);
          }
        } else m.delete().catch(() => {});
      })
      .catch(() => {
        m.delete().catch(() => {});
      });
    m.awaitReactions(
      (reaction, user) =>
        (reaction.emoji.id === msg.client.objectEmotes.tick.id ||
          reaction.emoji.id === msg.client.objectEmotes.cross.id) &&
        user.id === msg.author.id,
      { max: 1, time: 60000 },
    )
      .then((rawcollected) => {
        if (!rawcollected.first()) return;
        // eslint-disable-next-line no-underscore-dangle
        if (rawcollected.first()._emoji.id === msg.client.objectEmotes.tickID) {
          m.delete().catch(() => {});
          this.commandExe(msg);
        } else m.delete().catch(() => {});
      })
      .catch(() => {
        m.delete().catch(() => {});
      });
  },
  async DMcommand(msg) {
    if (msg.command.dm) {
      if (msg.command.takesFirstArg && !msg.args[0]) {
        msg.triedCMD = msg.command;
        msg.command = msg.client.commands.get('cmdhelp');
        this.thisGuildOnly(msg);
      } else {
        this.commandExe(msg);
      }
    } else return msg.client.ch.reply(msg, msg.language.commands.commandHandler.GuildOnly);
    return null;
  },
  async commandExe(msg) {
    msg.logchannels = [];
    if (msg.channel.type !== 1) {
      const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res && res.rowCount > 0) {
        msg.logchannels = res.rows[0].modlogs
          ?.map((id) =>
            typeof msg.client.channels.cache.get(id)?.send === 'function'
              ? msg.client.channels.cache.get(id)
              : null,
          )
          .filter((c) => c !== null);
      }
      if (!msg.logchannels) msg.logchannels = [];
    }
    try {
      if (msg.client.user.id === msg.client.mainID) {
        const statcord = require('../../../BaseClient/Statcord');
        statcord.postCommand(msg.command.name, msg.author.id).catch(() => {});
      }

      console.log(`Command executed: ${msg.command.name} | ${msg.channel.id}`);
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
  },
};

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
