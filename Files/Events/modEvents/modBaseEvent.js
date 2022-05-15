const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = async (args, type) => {
  const { executor, target, reason, msg, guild } = args;
  const client = args.client || args.executor.client;
  const mExistedPreviously = !!msg?.m;
  const language = msg?.language || (await client.ch.languageSelector(args.guild));
  const lan = language.mod[type];
  const con = args.executor.client.constants.mod[type];

  console.log(1);

  let action;
  let embed;
  let error;
  let dm;

  if (!args.doDBonly) {
    console.log(2);
    embed = loadingEmbed(mExistedPreviously, lan, con, args);

    if (msg && mExistedPreviously && msg.m.id) {
      await msg.client.ch.edit(msg.m, { embeds: [embed] });
    } else if (msg) msg.m = await args.executor.client.ch.reply(msg, { embeds: [embed] });

    const targetMember = await guild?.members.fetch(target.id).catch(() => {});
    const executingMember = await guild?.members.fetch(executor.id).catch(() => {});

    const roleCheckAllowed = await roleCheck(
      embed,
      mExistedPreviously,
      lan,
      targetMember,
      executingMember,
      args,
    );
    console.log(3);
    if (!roleCheckAllowed) return;

    const selfPunish = await checkSelfPunish(
      embed,
      mExistedPreviously,
      lan,
      targetMember,
      executingMember,
      args,
    );
    console.log(4);
    if (selfPunish) return;

    const mePunish = await checkMePunish(embed, mExistedPreviously, lan, targetMember, args);
    if (mePunish) return;

    const punishable = await checkPunishable(
      embed,
      mExistedPreviously,
      lan,
      targetMember,
      type,
      args,
    );
    console.log(5);
    if (!punishable) return;

    const actionTaken = await checkActionTaken(
      embed,
      mExistedPreviously,
      lan,
      targetMember,
      type,
      args,
    );
    console.log(6);
    if (actionTaken) return;

    dm = await doDM({ lan, language }, targetMember, reason, con, args);

    const actionReply = await takeAction(
      type,
      targetMember,
      executingMember,
      args,
      language,
      guild,
    );

    ({ action, error } = actionReply);
  }
  console.log(7);

  if (action || args.doDBonly) {
    logEmbed(lan, language, con, reason, args);
    if (!args.doDBonly) {
      await declareSuccess(embed, mExistedPreviously, lan, args);
    }
  } else if (error) {
    await errorEmbed(embed, lan, mExistedPreviously, dm, error, args);
    return;
  }
  console.log(8);

  doDataBaseAction(type, client, args, guild);

  if (msg && msg.source) args.executor.client.emit('modSourceHandler', msg, embed);
};

const declareSuccess = async (embed, mExistedPreviously, lan, args) => {
  if (!args.msg && !args.msg.id) return;

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.tick} ${args.executor.client.ch.stp(lan.success, {
        target: args.target,
        args,
      })}`,
    });
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(
      `${args.executor.client.textEmotes.tick} ${args.executor.client.ch.stp(lan.success, {
        target: args.target,
        args,
      })}`,
    );
  } else {
    embed.setDescription(
      `${args.executor.client.textEmotes.tick} ${args.executor.client.ch.stp(lan.success, {
        target: args.target,
        args,
      })}`,
    );
  }

  if (args.msg.m) {
    await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  }
};

const errorEmbed = async (embed, lan, mExistedPreviously, dm, err, args) => {
  if (!args.msg && !args.msg.id) return;

  if (dm) dm.delete().catch(() => {});

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.cross} ${
        lan.error
      } ${args.executor.client.ch.makeCodeBlock(err)}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(
      `${args.executor.client.textEmotes.cross} ${
        lan.error
      } ${args.executor.client.ch.makeCodeBlock(err)}`,
    );

    deleter(args);
  } else {
    embed.setDescription(
      `${args.executor.client.textEmotes.cross} ${
        lan.error
      } ${args.executor.client.ch.makeCodeBlock(err)}`,
    );

    deleter(args);
  }

  if (args.msg.m) {
    await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  }
};

const logEmbed = async (lan, language, con, reason, args) => {
  const getLogchannels = async () => {
    const res = await args.executor.client.ch.query(
      `SELECT * FROM logchannels WHERE guildid = $1 AND modlogs IS NOT NULL;`,
      [args.guild?.id],
    );

    if (res && res.rowCount) {
      return res.rows[0].modlogs.map((cid) => args.executor.client.channels.cache.get(cid));
    }
    return null;
  };

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(con.color)
    .setAuthor({
      name: args.executor.client.ch.stp(lan.author, { args }),
      iconURL: args.target.displayAvatarURL({ size: 4096 }),
      url: args.executor.client.constants.standard.invite,
    })
    .setDescription(
      args.executor.client.ch.stp(lan.description, {
        user: args.executor,
        args,
      }),
    )
    .setTimestamp()
    .setFooter({
      text: args.executor.client.ch.stp(lan.footer, {
        user: args.executor,
        args,
      }),
    });

  if (reason) embed.addFields({ name: language.reason, value: `${reason}` });

  if (args.duration) {
    embed.addFields({
      name: language.duration,
      value: moment
        .duration(args.duration)
        .format(
          `y [${language.time.years}], M [${language.time.months}], d [${language.time.days}], h [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
          { trim: 'all' },
        ),
      inline: false,
    });
  }

  const logchannels = await getLogchannels();
  if (logchannels && logchannels.length) {
    await args.executor.client.ch.send(logchannels, { embeds: [embed] });
  }
};

const loadingEmbed = (mExistedPreviously, lan, con, args) => {
  if (!args.msg && !args.msg.id) return null;

  if (mExistedPreviously && args.msg?.source) {
    args.msg.m.embeds[0].data.fields?.pop();

    return new Builders.UnsafeEmbedBuilder(args.msg.m.embeds[0].data)
      .setColor(con.color)
      .addFields({
        name: '\u200b',
        value: `${args.executor.client.textEmotes.loading} ${lan.loading}`,
      });
  }
  if (mExistedPreviously) {
    args.msg.m.embeds[0].data.fields?.pop();

    return new Builders.UnsafeEmbedBuilder(args.msg.m.embeds[0].data)
      .setColor(con.color)
      .setDescription(`${args.executor.client.textEmotes.loading} ${lan.loading}`);
  }
  return new Builders.UnsafeEmbedBuilder()
    .setColor(con.color)
    .setDescription(`${args.executor.client.textEmotes.loading} ${lan.loading}`);
};

const roleCheck = async (embed, mExistedPreviously, lan, targetMember, executingMember, args) => {
  if (args.forceFinish) return true;
  if (
    !executingMember ||
    !targetMember ||
    executingMember.roles.highest.position > targetMember?.roles.highest.position ||
    args.executor.id === args.guild?.ownerId
  ) {
    return true;
  }

  if (!args.msg && !args.msg.id) return false;

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.cross} ${lan.exeNoPerms}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.exeNoPerms}`);

    deleter(args);
  } else {
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.exeNoPerms}`);

    deleter(args);
  }

  await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  return false;
};

const checkSelfPunish = async (
  embed,
  mExistedPreviously,
  lan,
  targetMember,
  executingMember,
  args,
) => {
  if (args.forceFinish) return false;
  if (executingMember.id !== targetMember?.id) return false;
  if (!args.msg && !args.msg.id) return true;

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.cross} ${lan.selfPunish}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.selfPunish}`);

    deleter(args);
  } else {
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.selfPunish}`);

    deleter(args);
  }

  if (mExistedPreviously && args.msg.m) {
    await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  }
  return true;
};

const checkMePunish = async (embed, mExistedPreviously, lan, targetMember, args) => {
  if (args.forceFinish) return false;
  if (targetMember?.id !== args.executor.client.user.id) return false;
  if (!args.msg && !args.msg.id) return true;

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.cross} ${lan.mePunish}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.mePunish}`);

    deleter(args);
  } else {
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.mePunish}`);

    deleter(args);
  }

  if (args.msg.m) await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  return true;
};

const checkPunishable = async (
  embed,
  mExistedPreviously,
  lan,
  targetMember,
  punishmentType,
  args,
) => {
  switch (punishmentType) {
    case 'muteRemove':
    case 'tempmuteAdd': {
      if (targetMember?.moderatable) {
        return true;
      }
      break;
    }
    case 'banAdd':
    case 'softbanAdd':
    case 'tempbanAdd': {
      if (targetMember?.bannable || (!targetMember && args.guild?.me.permissions.has(4n))) {
        return true;
      }
      break;
    }
    case 'channelbanAdd':
    case 'tempchannelbanAdd':
    case 'channelbanRemove': {
      if (args.channel.manageable && targetMember) return true;
      break;
    }
    case 'banRemove': {
      if (args.guild?.me.permissions.has(4n)) return true;
      break;
    }
    case 'kickAdd': {
      if (targetMember?.kickable || (!targetMember && args.guild?.me.permissions.has(2n))) {
        return true;
      }
      break;
    }
    case 'roleAdd': {
      if (
        args.role.rawPosition < args.guild?.me.roles.highest.rawPosition &&
        targetMember?.manageable
      ) {
        return true;
      }
      break;
    }
    case 'roleRemove': {
      if (
        args.role.rawPosition < args.guild?.me.roles.highest.rawPosition &&
        targetMember?.manageable
      ) {
        return true;
      }
      break;
    }
    default: {
      return true;
    }
  }

  if (args.forceFinish) return true;
  if (!args.msg && !args.msg.id) return false;

  if (mExistedPreviously && args.msg?.source) {
    embed.data.fields?.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.executor.client.textEmotes.cross} ${lan.permissionError}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.data.fields?.pop();
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.permissionError}`);

    deleter(args);
  } else {
    embed.setDescription(`${args.executor.client.textEmotes.cross} ${lan.permissionError}`);

    deleter(args);
  }

  if (args.msg.m) await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
  return false;
};

const doDM = async ({ lan, language }, targetMember, reason, con, args) => {
  const dmChannel = await targetMember?.createDM().catch(() => {});
  const DMembed = new Builders.UnsafeEmbedBuilder()
    .setColor(con.color)
    .setTimestamp()
    .setAuthor({
      name: args.executor.client.ch.stp(lan.dm.author, { guild: args.guild, args }),
      iconURL: con.author.image,
      url: args.executor.client.ch.stp(con.author.link, { guild: args.guild, args }),
    });

  if (reason) DMembed.setDescription(`**${language.reason}:** \n${reason}`);

  const m = await args.executor.client.ch.send(dmChannel, { embeds: [DMembed] });

  return m;
};

const checkActionTaken = async (
  embed,
  mExistedPreviously,
  lan,
  targetMember,
  punishmentType,
  args,
) => {
  let punished = false;

  switch (punishmentType) {
    case 'muteRemove': {
      punished = !targetMember?.isCommunicationDisabled();
      break;
    }
    case 'tempmuteAdd': {
      punished = targetMember?.isCommunicationDisabled();
      break;
    }
    case 'banAdd':
    case 'softbanAdd':
    case 'tempbanAdd': {
      punished = await args.guild?.bans.fetch(args.target.id).catch(() => {});
      break;
    }
    case 'channelbanAdd':
    case 'tempchannelbanAdd': {
      punished =
        args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(2048n) &&
        args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(274877906944n) &&
        args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(1024n) &&
        args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(64n) &&
        args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(1048576n);
      break;
    }
    case 'channelbanRemove': {
      punished =
        !args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(2048n) ||
        !args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(274877906944n) ||
        !args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(1024n) ||
        !args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(64n) ||
        !args.channel?.permissionOverwrites.cache.get(args.target.id)?.deny.has(1048576n);
      break;
    }
    case 'banRemove': {
      punished = !(await args.guild?.bans.fetch(args.target.id).catch(() => {}));
      break;
    }
    case 'kickAdd': {
      punished = !args.guild?.members.cache.has(args.target.id);
      break;
    }
    case 'roleAdd': {
      punished = targetMember?.roles.cache.has(args.role.id);
      break;
    }
    case 'roleRemove': {
      punished = !targetMember?.roles.cache.has(args.role.id);
      break;
    }
    default: {
      punished = false;
      break;
    }
  }

  if (args.forceFinish) return false;

  if (punished) {
    if (!args.msg && !args.msg.id) return true;

    const deleter = () => {
      jobs.scheduleJob(new Date(Date.now() + 10000), () => {
        if (args.msg.m) args.msg.m.delete().catch(() => {});
        if (args.msg) args.msg.delete().catch(() => {});
      });
    };

    if (mExistedPreviously && args.msg?.source) {
      embed.data.fields?.pop();
      embed.addFields({
        name: '\u200b',
        value: `${args.executor.client.textEmotes.cross} ${args.executor.client.ch.stp(
          lan.alreadyApplied,
          {
            target: args.target,
            args,
          },
        )}`,
      });

      deleter(args);
    } else if (mExistedPreviously) {
      embed.data.fields?.pop();
      embed.setDescription(
        `${args.executor.client.textEmotes.cross} ${args.executor.client.ch.stp(
          lan.alreadyApplied,
          {
            target: args.target,
            args,
          },
        )}`,
      );

      deleter(args);
    } else {
      embed.setDescription(
        `${args.executor.client.textEmotes.cross} ${args.executor.client.ch.stp(
          lan.alreadyApplied,
          {
            target: args.target,
            args,
          },
        )}`,
      );

      deleter(args);
    }

    if (args.msg.m) await args.executor.client.ch.edit(args.msg.m, { embeds: [embed] });
    return true;
  }

  return false;
};

const takeAction = async (punishmentType, targetMember, executingMember, args, language, guild) => {
  let punished;
  let error;

  switch (punishmentType) {
    case 'muteRemove': {
      punished = await targetMember
        ?.timeout(null, `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'tempmuteAdd': {
      punished = await targetMember
        ?.timeout(
          Number(args.duration),
          `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
        )
        .catch((err) => {
          error = err;
        });

      args.executor.client.mutes.set(
        `${guild?.id}-${args.target.id}`,
        jobs.scheduleJob(
          `${guild?.id}-${args.target.id}`,
          new Date(Date.now() + args.duration),
          () => {
            args.executor.client.emit(
              'modBaseEvent',
              {
                target: args.target,
                reason: language.ready.unmute.reason,
                executor: args.executor.client.user,
                msg: args.msg,
                guild,
                forceFinish: true,
                doDBonly: true,
              },
              'muteRemove',
            );
          },
        ),
      );
      break;
    }
    case 'banAdd': {
      punished = await targetMember
        ?.ban({
          deleteMessageDays: 7,
          reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
        })
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'softbanAdd': {
      punished = await targetMember
        ?.ban({
          deleteMessageDays: 7,
          reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
        })
        .catch((err) => {
          error = err;
        });

      if (punished) {
        punished = await guild?.bans
          .remove(args.target.id, `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`)
          .catch((err) => {
            error = err;
          });
      }

      break;
    }
    case 'tempbanAdd': {
      punished = await targetMember
        ?.ban({
          deleteMessageDays: 7,
          reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
        })
        .catch((err) => {
          error = err;
        });

      args.executor.client.bans.set(
        `${guild?.id}-${args.target.id}`,
        jobs.scheduleJob(
          `${guild?.id}-${args.target.id}`,
          new Date(Date.now() + args.duration),
          () => {
            args.executor.client.emit(
              'modBaseEvent',
              {
                target: args.target,
                reason: language.ready.unban.reason,
                executor: args.executor.client.user,
                msg: args.msg,
                guild,
                forceFinish: true,
              },
              'banRemove',
            );
          },
        ),
      );
      break;
    }
    case 'tempchannelbanAdd':
    case 'channelbanAdd': {
      if (!args.channel?.permissionOverwrites.cache.has(args.target.id)) {
        punished = await args.channel.permissionOverwrites
          .create(
            args.target.id,
            {},
            {
              reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
              type: 1,
            },
          )
          .catch((err) => {
            error = err;
          });
      }

      if (!error) {
        punished = await args.channel?.permissionOverwrites
          .edit(
            args.target.id,
            {
              SendMessages: false,
              Connect: false,
              ViewChannel: false,
              SendMessagesInThreads: false,
              AddReactions: false,
            },
            {
              reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
              type: 1,
            },
          )
          .catch((err) => {
            error = err;
          });
      }

      if (punishmentType === 'tempchannelbanAdd') {
        args.executor.client.channelBans.set(
          `${args.channel?.id}-${args.target.id}`,
          jobs.scheduleJob(
            `${args.channel?.id}-${args.target.id}`,
            new Date(Date.now() + args.duration),
            () => {
              args.executor.client.emit(
                'modBaseEvent',
                {
                  target: args.target,
                  reason: language.ready.channelunban.reason,
                  executor: args.executor.client.user,
                  msg: args.msg,
                  guild,
                  channel: args.channel,
                  forceFinish: true,
                },
                'channelbanRemove',
              );
            },
          ),
        );
      }
      break;
    }
    case 'channelbanRemove': {
      punished = await args.channel?.permissionOverwrites
        .edit(
          args.target.id,
          {
            SendMessages: null,
            Connect: null,
            ViewChannel: null,
            SendMessagesInThreads: null,
            AddReactions: null,
          },
          {
            reason: `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`,
            type: 1,
          },
        )
        .catch((err) => {
          error = err;
        });

      if (
        punished &&
        punished.permissionOverwrites.cache.get(args.target.id).deny.bitfield === 0n &&
        punished.permissionOverwrites.cache.get(args.target.id).allow.bitfield === 0n
      ) {
        punished = await args.channel.permissionOverwrites
          .delete(args.target.id, `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`)
          .catch((err) => {
            error = err;
          });
      }
      break;
    }
    case 'banRemove': {
      punished = await guild?.bans
        .remove(args.target.id, `${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'kickAdd': {
      punished = await targetMember
        ?.kick(`${args.executor.tag} ${args.reason ? `| ${args.reason}` : ''}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'roleAdd': {
      punished = targetMember?.roles.add(args.role.id).catch((err) => {
        error = err;
      });
      break;
    }
    case 'roleRemove': {
      punished = targetMember?.roles.remove(args.role.id).catch((err) => {
        error = err;
      });
      break;
    }
    default: {
      return { action: true, error: false };
    }
  }

  return { action: punished, error };
};

const doDataBaseAction = async (punishmentType, client, args, guild) => {
  const getAndDeleteRow = async (
    table,
    insertTable,
    extraSelectArgs,
    extraArgs,
    extraInsertArgNames,
    extraInsertArgs,
  ) => {
    const selectArray = extraArgs
      ? [args.target.id, guild?.id, ...extraArgs]
      : [args.target.id, guild?.id];

    const res = await client.ch.query(
      `SELECT * FROM ${table} WHERE userid = $1 AND guildid = $2 ${
        extraSelectArgs
          ? `${extraSelectArgs.map((arg, i) => `AND ${arg} = $${i + 3}`).join('')}`
          : ''
      }`,
      selectArray,
    );

    if (res && res.rowCount) {
      await client.ch.query(
        `DELETE FROM ${table} WHERE userid = $1 AND guildid = $2 AND uniquetimestamp = $3;`,
        [args.target.id, guild?.id, res.rows[0].uniquetimestamp],
      ); // js

      const [row] = res.rows;

      const insertArgs = extraInsertArgs
        ? [
            row.guildid,
            row.userid,
            row.reason,
            row.uniquetimestamp,
            row.channelid,
            row.channelname,
            row.executorid,
            row.executorname,
            row.msgid,
            ...extraInsertArgs,
          ]
        : [
            row.guildid,
            row.userid,
            row.reason,
            row.uniquetimestamp,
            row.channelid,
            row.channelname,
            row.executorid,
            row.executorname,
            row.msgid,
          ];

      if (
        !extraInsertArgs ||
        (extraInsertArgNames && extraInsertArgs.length < extraInsertArgNames.length)
      ) {
        const cloneArr = extraInsertArgNames.slice();
        cloneArr.splice(
          0,
          Math.abs(
            (extraInsertArgs ? extraInsertArgs.length : 0) -
              (extraInsertArgs ? extraInsertArgNames.length : 0),
          ),
        );

        const mergeArr = cloneArr.map((arg) => row[arg]);

        insertArgs.push(...mergeArr);
      }

      await client.ch.query(
        `INSERT INTO ${insertTable} (guildid, userid, reason, uniquetimestamp, channelid, channelname, executorid, executorname, msgid${
          extraInsertArgNames ? `, ${extraInsertArgNames.join(', ')}` : ''
        }) VALUES
      (${insertArgs ? `${insertArgs.map((arg, i) => `$${i + 1}`).join(', ')}` : ''});`,
        insertArgs,
      );
      return row;
    }
    return null;
  };

  const insertRow = (table, extraArgNames, extraArgs) => {
    const insertArgs = extraArgs
      ? [
          guild?.id,
          args.target.id,
          args.reason,
          Date.now(),
          args.msg.channel.id,
          args.msg.channel.name,
          args.executor.id,
          args.executor.tag,
          args.msg.id,
          ...extraArgs,
        ]
      : [
          guild?.id,
          args.target.id,
          args.reason,
          Date.now(),
          args.msg.channel.id,
          args.msg.channel.name,
          args.executor.id,
          args.executor.tag,
          args.msg.id,
        ];

    client.ch.query(
      `INSERT INTO ${table} (guildid, userid, reason, uniquetimestamp, channelid, channelname, executorid, executorname, msgid${
        extraArgNames ? `, ${extraArgNames.join(', ')}` : '' // `
      }) VALUES (
        ${insertArgs ? `${insertArgs.map((arg, i) => `$${i + 1}`).join(', ')}` : ''});`,
      insertArgs,
    );
  };

  switch (punishmentType) {
    case 'muteRemove': {
      getAndDeleteRow('punish_tempmutes', 'punish_mutes', null, null, ['duration']);
      break;
    }
    case 'tempmuteAdd': {
      insertRow('punish_tempmutes', ['duration'], [args.duration]);
      break;
    }
    case 'banAdd':
    case 'softbanAdd': {
      insertRow('punish_bans');
      break;
    }
    case 'tempbanAdd': {
      insertRow('punish_tempbans', ['duration'], [args.duration]);
      break;
    }
    case 'channelbanAdd': {
      insertRow('punish_channelbans', ['banchannelid'], [args.channel.id]);
      break;
    }
    case 'tempchannelbanAdd': {
      insertRow(
        'punish_tempchannelbans',
        ['banchannelid', 'duration'],
        [args.channel.id, args.duration],
      );
      break;
    }
    case 'channelbanRemove': {
      getAndDeleteRow(
        'punish_tempchannelbans',
        'punish_channelbans',
        ['banchannelid'],
        [args.channel?.id],
        ['banchannelid', 'duration'],
        [args.channel?.id],
      );
      break;
    }
    case 'banRemove': {
      getAndDeleteRow('punish_tempbans', 'punish_bans', null, null, ['duration']);
      break;
    }
    case 'kickAdd': {
      insertRow('punish_kicks');
      break;
    }
    case 'warnAdd': {
      insertRow('punish_warns');
      break;
    }
    default: {
      break;
    }
  }
};

const deleter = (args) => {
  jobs.scheduleJob(new Date(Date.now() + 10000), () => {
    if (args.msg.m) args.msg.m.delete().catch(() => {});
    if (args.msg) args.msg.delete().catch(() => {});
  });
};
