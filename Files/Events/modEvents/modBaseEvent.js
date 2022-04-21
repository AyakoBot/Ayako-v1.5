const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = async (args, type) => {
  const { executor, target, reason, msg, guild } = args;
  const client = args.client || args.guild.client;
  const mExistedPreviously = !!msg.m;
  const language = msg.language || (await client.ch.languageSelector(args.guild));
  const lan = language.mod[type];
  const con = args.guild.client.constants.mod[type];

  const embed = loadingEmbed(mExistedPreviously, lan, con, args);

  if (msg && mExistedPreviously && msg.m.id) await msg.m.edit({ embeds: [embed] }).catch(() => {});
  else if (msg) msg.m = await args.guild.client.ch.reply(msg, { embeds: [embed] });

  const targetMember = await guild.members.fetch(target.id).catch(() => {});
  const executingMember = await guild.members.fetch(executor.id).catch(() => {});

  const roleCheckAllowed = roleCheck(
    embed,
    mExistedPreviously,
    lan,
    targetMember,
    executingMember,
    args,
  );
  if (!roleCheckAllowed) return;

  const selfPunish = checkSelfPunish(
    embed,
    mExistedPreviously,
    lan,
    targetMember,
    executingMember,
    args,
  );
  if (selfPunish) return;

  const mePunish = checkMePunish(embed, mExistedPreviously, lan, targetMember, args);
  if (mePunish) return;

  const punishable = checkPunishable(embed, mExistedPreviously, lan, targetMember, type, args);
  if (!punishable) return;

  const actionTaken = await checkActionTaken(
    embed,
    mExistedPreviously,
    lan,
    targetMember,
    type,
    args,
  );
  if (actionTaken) return;

  const dm = await doDM({ lan, language }, targetMember, reason, con, args);

  const { action, error } = await takeAction(
    type,
    targetMember,
    executingMember,
    args,
    language,
    guild,
  );

  if (action) {
    logEmbed(lan, language, executingMember, con, reason, args);
    await declareSuccess(embed, mExistedPreviously, lan, args);
  } else if (error) {
    errorEmbed(embed, lan, mExistedPreviously, dm, error, args);
    return;
  }

  doDataBaseAction(type, client, args, guild);

  if (msg && msg.source) args.guild.client.emit('modSourceHandler', msg, embed);
};

const declareSuccess = async (embed, mExistedPreviously, lan, args) => {
  if (!args.msg && !args.msg.id) return;

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.guild.client.textEmotes.tick} ${args.guild.client.ch.stp(lan.success, {
        target: args.target,
      })}`,
    });
  } else {
    embed.setDescription(
      `${args.guild.client.textEmotes.tick} ${args.guild.client.ch.stp(lan.success, {
        target: args.target,
      })}`,
    );
  }

  if (args.msg.m) await args.msg.m.edit({ embeds: [embed] }).catch(() => {});
};

const errorEmbed = (embed, lan, mExistedPreviously, dm, err, args) => {
  if (!args.msg && !args.msg.id) return;

  if (dm) dm.delete().catch(() => {});

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${
        args.guild.client.textEmotes.cross + lan.error
      } ${args.guild.client.ch.makeCodeBlock(err)}`,
    });

    deleter(args);
  } else {
    embed.setDescription(
      `${args.guild.client.textEmotes.cross + lan.error} ${args.guild.client.ch.makeCodeBlock(
        err,
      )}`,
    );

    deleter(args);
  }

  if (args.msg.m) args.msg.m.edit({ embeds: [embed] }).catch(() => {});
};

const logEmbed = async (lan, language, executingMember, con, reason, args) => {
  const getLogchannels = async () => {
    const res = await args.guild.client.ch.query(
      `SELECT * FROM logchannels WHERE guildid = $1 AND modlogs IS NOT NULL;`,
      [args.guild.id],
    );

    if (res && res.rowCount) {
      return res.rows[0].modlogs.map((cid) => args.guild.client.channels.cache.get(cid));
    }
    return null;
  };

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(con.color)
    .setAuthor({
      name: args.guild.client.ch.stp(lan.author, { args }),
      iconURL: args.target.displayAvatarURL({ size: 4096 }),
      url: args.guild.client.constants.standard.invite,
    })
    .setDescription(
      args.guild.client.ch.stp(lan.description, {
        user: executingMember.user,
        args,
      }),
    )
    .setTimestamp()
    .addFields({ name: language.reason, value: `${reason}` })
    .setFooter({
      text: args.guild.client.ch.stp(lan.footer, {
        user: executingMember.user,
        args,
      }),
    });

  const logchannels = await getLogchannels();
  if (logchannels && logchannels.length) {
    args.guild.client.ch.send(logchannels, { embeds: [embed] });
  }
};

const loadingEmbed = (mExistedPreviously, lan, con, args) => {
  if (!args.msg && !args.msg.id) return null;
  return mExistedPreviously
    ? new Builders.UnsafeEmbedBuilder(args.msg.m.embeds[0]).setColor(con.color).addFields({
        name: '\u200b',
        value: `${args.guild.client.textEmotes.loading} ${lan.loading}`,
      })
    : new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setDescription(`${args.guild.client.textEmotes.loading} ${lan.loading}`);
};

const roleCheck = (embed, mExistedPreviously, lan, targetMember, executingMember, args) => {
  if (
    !executingMember ||
    !targetMember ||
    executingMember.roles.highest.position > targetMember.roles.highest.position ||
    executingMember.user.id === args.guild.ownerId
  ) {
    return true;
  }
  if (!args.msg && !args.msg.id) return false;

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.guild.client.textEmotes.cross} ${lan.exeNoPerms}`,
    });

    deleter(args);
  } else {
    embed.setDescription(`${args.guild.client.textEmotes.cross} ${lan.exeNoPerms}`);

    deleter(args);
  }

  args.msg.m.edit({ embeds: [embed] }).catch(() => {});
  return false;
};

const checkSelfPunish = (embed, mExistedPreviously, lan, targetMember, executingMember, args) => {
  if (executingMember.id !== targetMember.id) return false;
  if (!args.msg && !args.msg.id) return true;

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.guild.client.textEmotes.cross} ${lan.selfPunish}`,
    });

    deleter(args);
  } else {
    embed.setDescription(`${args.guild.client.textEmotes.cross} ${lan.selfPunish}`);

    deleter(args);
  }

  if (mExistedPreviously) {
    if (args.msg.m) args.msg.m.edit({ embeds: [embed] }).catch(() => {});
  }
  return true;
};

const checkMePunish = (embed, mExistedPreviously, lan, targetMember, args) => {
  if (targetMember.id !== args.guild.client.user.id) return false;
  if (!args.msg && !args.msg.id) return true;

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.guild.client.textEmotes.cross} ${lan.mePunish}`,
    });

    deleter(args);
  } else {
    embed.setDescription(`${args.guild.client.textEmotes.cross} ${lan.mePunish}`);

    deleter(args);
  }

  if (args.msg.m) args.msg.m.edit({ embeds: [embed] });
  return true;
};

const checkPunishable = (embed, mExistedPreviously, lan, targetMember, punishmentType, args) => {
  switch (punishmentType) {
    case 'muteRemove': {
      if (targetMember?.moderatable) {
        return true;
      }
      break;
    }
    case 'tempmuteAdd': {
      if (targetMember?.moderatable) {
        return true;
      }
      break;
    }
    case 'banAdd': {
      if (targetMember?.bannable || (!targetMember && args.guild.me.permissions.has(4n))) {
        return true;
      }
      break;
    }
    case 'softbanAdd': {
      if (targetMember?.bannable || (!targetMember && args.guild.me.permissions.has(4n))) {
        return true;
      }
      break;
    }
    case 'tempbanAdd': {
      if (targetMember?.bannable || (!targetMember && args.guild.me.permissions.has(4n))) {
        return true;
      }
      break;
    }
    case 'channelbanAdd' || 'tempchannelbanAdd': {
      if (args.channel.manageable && targetMember) return true;
      break;
    }
    case 'channelbanRemove': {
      if (args.channel.manageable && targetMember) return true;
      break;
    }
    case 'banRemove': {
      if (args.guild.me.permissions.has(4n)) return true;
      break;
    }
    case 'kickAdd': {
      if (targetMember?.kickable || (!targetMember && args.guild.me.permissions.has(2n))) {
        return true;
      }
      break;
    }
    default: {
      break;
    }
  }

  if (!args.msg && !args.msg.id) return false;

  if (mExistedPreviously) {
    embed.data.fields.pop();
    embed.addFields({
      name: '\u200b',
      value: `${args.guild.client.textEmotes.cross} ${lan.permissionError}`,
    });

    deleter(args);
  } else {
    embed.setDescription(`${args.guild.client.textEmotes.cross} ${lan.permissionError}`);

    deleter(args);
  }
  if (args.msg.m) args.msg.m.edit({ embeds: [embed] });
  return false;
};

const doDM = async ({ lan, language }, targetMember, reason, con, args) => {
  const dmChannel = await targetMember?.createDM().catch(() => {});
  const DMembed = new Builders.UnsafeEmbedBuilder()
    .setDescription(`**${language.reason}:** \n${reason}`)
    .setColor(con.color)
    .setTimestamp()
    .setAuthor({
      name: args.guild.client.ch.stp(lan.dm.author, { guild: args.guild }),
      iconURL: lan.author.image,
      url: args.guild.client.ch.stp(con.author.link, { guild: args.guild }),
    });
  const m = await args.guild.client.ch.send(dmChannel, { embeds: [DMembed] });

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
      punished = !targetMember.isCommunicationDisabled();
      break;
    }
    case 'tempmuteAdd': {
      punished = targetMember.isCommunicationDisabled();
      break;
    }
    case 'banAdd': {
      punished = await args.guild.bans.fetch(args.target).catch(() => {});
      break;
    }
    case 'softbanAdd': {
      punished = await args.guild.bans.fetch(args.target).catch(() => {});
      break;
    }
    case 'tempbanAdd': {
      punished = await args.guild.bans.fetch(args.target).catch(() => {});
      break;
    }
    case 'channelbanAdd' || 'tempchannelbanAdd': {
      punished =
        args.channel.permissionOverwrites.cache.get(args.target.id)?.deny.has(2048n) &&
        args.channel.permissionOverwrites.cache.get(args.target.id)?.deny.has(1048576n);
      break;
    }
    case 'channelbanRemove': {
      punished =
        !args.channel.permissionOverwrites.cache.get(args.target.id)?.deny.has(2048n) ||
        !args.channel.permissionOverwrites.cache.get(args.target.id)?.deny.has(1048576n);
      break;
    }
    case 'banRemove': {
      punished = await args.guild.bans.fetch(args.target).catch(() => {});
      break;
    }
    case 'kickAdd': {
      punished = !args.guild.members.cache.has(args.target.id);
      break;
    }
    default: {
      break;
    }
  }

  if (punished) {
    if (!args.msg && !args.msg.id) return true;

    const deleter = () => {
      jobs.scheduleJob(new Date(Date.now() + 10000), () => {
        if (args.msg.m) args.msg.m.delete().catch(() => {});
        if (args.msg) args.msg.delete().catch(() => {});
      });
    };

    if (mExistedPreviously) {
      embed.data.fields.pop();
      embed.addFields({
        name: '\u200b',
        value: `${args.guild.client.textEmotes.cross} ${args.guild.client.ch.stp(
          lan.alreadyApplied,
          {
            target: args.target,
          },
        )}`,
      });

      deleter(args);
    } else {
      embed.setDescription(
        `${args.guild.client.textEmotes.cross} ${args.guild.client.ch.stp(lan.alreadyApplied, {
          target: args.target,
        })}`,
      );

      deleter(args);
    }
    if (args.msg.m) args.msg.m.edit({ embeds: [embed] });
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
        .timeout(null, `${args.executor.tag} | ${args.reason}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'tempmuteAdd': {
      punished = await targetMember
        .timeout(args.duration, `${args.executor.tag} | ${args.reason}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'banAdd': {
      punished = await targetMember
        .ban({ deleteMessageDays: 7, reason: `${args.executor.tag} | ${args.reason}` })
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'softbanAdd': {
      const { user } = targetMember;

      punished = await targetMember
        .ban({ deleteMessageDays: 7, reason: `${args.executor.tag} | ${args.reason}` })
        .catch((err) => {
          error = err;
        });

      if (punished) {
        punished = await guild.bans
          .remove(user.id, `${args.executor.tag} | ${args.reason}`)
          .catch((err) => {
            error = err;
          });
      }

      break;
    }
    case 'tempbanAdd': {
      punished = await targetMember
        .ban({ deleteMessageDays: 7, reason: `${args.executor.tag} | ${args.reason}` })
        .catch((err) => {
          error = err;
        });

      guild.client.bans.set(
        `${guild.id}-${args.target.id}`,
        jobs.scheduleJob(
          `${guild.id}-${args.target.id}`,
          new Date(Date.now() + args.duration),
          () => {
            targetMember.client.emit(
              'modBaseEvent',
              {
                target: args.target,
                reason: language.ready.unmute.reason,
                executor: executingMember,
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
    case 'channelbanAdd' || 'tempchannelbanAdd': {
      if (!args.channel.permissionOverwrites.cache.has(args.target.id)) {
        punished = await args.channel.permissionOverwrites
          .create(
            args.target.id,
            {},
            {
              reason: `${args.executor.tag} | ${args.reason}`,
              type: 1,
            },
          )
          .catch((err) => {
            error = err;
          });
      }

      if (!error) {
        punished = await args.channel.permissionOverwrites
          .edit(
            args.target.id,
            { SendMessages: false, Connect: false },
            {
              reason: `${args.executor.tag} | ${args.reason}`,
              type: 1,
            },
          )
          .catch((err) => {
            error = err;
          });
      }

      if (punishmentType === 'tempchannelbanAdd') {
        guild.client.channelBans.set(
          `${guild.id}-${args.target.id}`,
          jobs.scheduleJob(
            `${guild.id}-${args.target.id}`,
            new Date(Date.now() + args.duration),
            () => {
              targetMember.client.emit(
                'modBaseEvent',
                {
                  target: args.target,
                  reason: language.ready.unmute.reason,
                  executor: executingMember,
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
      punished = await args.channel.permissionOverwrites
        .edit(
          args.target.id,
          { SendMessages: null, Connect: null },
          {
            reason: `${args.executor.tag} | ${args.reason}`,
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
          .delete(args.target.id, `${args.executor.tag} | ${args.reason}`)
          .catch((err) => {
            error = err;
          });
      }
      break;
    }
    case 'banRemove': {
      punished = await guild.bans
        .remove(args.target.id, `${args.executor.tag} | ${args.reason}`)
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'kickAdd': {
      punished = await targetMember.kick(`${args.executor.tag} | ${args.reason}`).catch((err) => {
        error = err;
      });
      break;
    }
    default: {
      break;
    }
  }

  return { action: punished, error };
};

const doDataBaseAction = async (punishmentType, client, args, guild) => {
  const getAndDeleteRow = async (
    table,
    extraSelectArgs,
    extraArgs,
    extraInsertArgNames,
    extraInsertArgs,
  ) => {
    const selectArray = extraArgs
      ? [args.target.id, guild.id, ...extraArgs]
      : [args.target.id, guild.id];

    const res = await client.ch.query(
      `SELECT * FROM ${table} WHERE userid = $1 AND guildid = $2 ${extraSelectArgs || ''};`,
      selectArray,
    );

    if (res && res.rowCount) {
      await client.ch.query(
        `DELETE FROM ${table} WHERE userid = $1 AND guildid = $2 AND uniquetimestamp = $3;`,
        [args.target.id, guild.id, res.rows[0].uniquetimestamp],
      );

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

      await client.ch.query(
        `INSERT INTO ${table} (guildid, userid, reason, uniquetimestamp, channelid, channelname, executorid, executorname, msgid${
          extraInsertArgNames ? `${extraInsertArgNames.map((arg) => `, ${arg}`).join('')}` : ''
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
          guild.id,
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
          guild.id,
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
        extraArgNames ? `${extraArgNames.map((arg) => `, ${arg}`).join('')}` : ''
      }) VALUES (
        ${insertArgs ? `${insertArgs.map((arg, i) => `$${i + 1}`).join(', ')}` : ''});`,
      insertArgs,
    );
  };

  switch (punishmentType) {
    case 'muteRemove': {
      getAndDeleteRow('punish_tempmutes');
      break;
    }
    case 'tempmuteAdd': {
      insertRow('punish_tempmutes', ['duration'], [args.duration]);
      break;
    }
    case 'banAdd': {
      insertRow('punish_bans');
      break;
    }
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
      getAndDeleteRow('punish_tempchannelbans', 'AND banchannelid = $3', [args.channel.id]);
      break;
    }
    case 'banRemove': {
      getAndDeleteRow('punish_tempbans');
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
