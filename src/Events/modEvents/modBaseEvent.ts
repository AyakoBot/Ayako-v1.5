import jobs from 'node-schedule';
import moment from 'moment';
import 'moment-duration-format';
import * as Eris from 'eris';
import Discord from 'discord.js';
import client from '../../BaseClient/ErisClient';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';

type Language = typeof import('../../Languages/lan-en.json');

export default async (args: CT.ModBaseEventOptions) => {
  const { executor, target, reason, msg, guild, type, source } = args;
  let { m } = args;

  if (!target) return;
  if (!msg.guildID) return;

  const mExistedPreviously = !!m;
  const language = msg?.language || (await client.ch.languageSelector(guild.id));

  let action;
  let embed: Eris.Embed | undefined | null;
  let error;
  let dm;

  if (!args.doDBonly) {
    embed = loadingEmbed(mExistedPreviously, language, args);
    if (!embed) return;

    if (msg && mExistedPreviously && m) {
      await client.ch.edit(m, { embeds: [embed] });
    } else if (msg) {
      const reply = await client.ch.reply(msg, { embeds: [embed] }, msg.language);
      if (reply) m = reply;
    }

    const targetMember = await client.ch.getMember(target.id, msg.guildID);
    const executingMember = await client.ch.getMember(executor.id, msg.guildID);
    if (!executingMember) return;

    const roleCheckAllowed = await roleCheck(
      embed,
      mExistedPreviously,
      language,
      targetMember,
      executingMember,
      args,
    );
    if (!roleCheckAllowed) return;

    const selfPunish = await checkSelfPunish(
      embed,
      mExistedPreviously,
      language,
      targetMember,
      executingMember,
      args,
    );
    if (selfPunish) return;

    const mePunish = await checkMePunish(embed, mExistedPreviously, language, targetMember, args);
    if (mePunish) return;

    const punishable = await checkPunishable(
      embed,
      mExistedPreviously,
      language,
      targetMember,
      type,
      args,
    );
    if (!punishable) return;

    const actionTaken = await checkActionTaken(
      embed,
      mExistedPreviously,
      language,
      targetMember,
      args,
    );
    if (actionTaken) return;

    dm = await doDM(language, targetMember, reason, args);

    const actionReply = await takeAction(targetMember, args, language);

    ({ action, error } = actionReply);
  }

  if (action || args.doDBonly) {
    logEmbed(language, reason, args);
    if (!args.doDBonly) {
      await declareSuccess(embed, mExistedPreviously, language, args);
    }
  } else if (error) {
    await errorEmbed(embed, language, mExistedPreviously, dm, error, args);
    return;
  }

  doDataBaseAction(args);

  if (msg && source) client.emit('modSourceHandler', m, source, null, embed);
};

const declareSuccess = async (
  embed: Eris.Embed | undefined | null,
  mExistedPreviously: boolean,
  language: Language,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];
  if (!args.msg) return;
  if (!embed) return;

  if (mExistedPreviously && args.source) {
    embed.fields?.pop();
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.tick} ${client.ch.stp(lan.success, {
        target: args.target,
        args,
      })}`,
    });
  } else if (mExistedPreviously) {
    embed.fields?.pop();
    embed.description = `${client.stringEmotes.tick} ${client.ch.stp(lan.success, {
      target: args.target,
      args,
    })}`;
  } else {
    embed.description = `${client.stringEmotes.tick} ${client.ch.stp(lan.success, {
      target: args.target,
      args,
    })}`;
  }

  if (args.m) {
    await client.ch.edit(args.m, { embeds: [embed] });
  }
};

const errorEmbed = async (
  embed: Eris.Embed | undefined | null,
  language: Language,
  mExistedPreviously: boolean,
  dm: Eris.Message<Eris.TextableChannel> | null | undefined,
  err: boolean | undefined,
  args: CT.ModBaseEventOptions,
) => {
  if (!args.msg) return;
  dm?.delete().catch(() => null);
  if (!embed) return;

  if (mExistedPreviously && args.source) {
    embed.fields?.pop();
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.cross} ${language.error} ${client.ch.util.makeCodeBlock(
        String(err),
      )}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.fields?.pop();
    embed.description = `${client.stringEmotes.cross} ${
      language.error
    } ${client.ch.util.makeCodeBlock(String(err))}`;

    deleter(args);
  } else {
    embed.description = `${client.stringEmotes.cross} ${
      language.error
    } ${client.ch.util.makeCodeBlock(String(err))}`;

    deleter(args);
  }

  if (args.m) {
    await client.ch.edit(args.m, { embeds: [embed] });
  }
};

const logEmbed = async (language: Language, reason: string, args: CT.ModBaseEventOptions) => {
  const lan = language.mod[args.type];
  const con = client.constants.mod[args.type];

  const getLogchannels = async () => {
    const logchannelsRow = await client.ch
      .query(`SELECT modlogs FROM logchannels WHERE guildid = $1 AND modlogs IS NOT NULL;`, [
        args.guild.id,
      ])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].modlogs : null));

    if (logchannelsRow) {
      return logchannelsRow.map((cid) => args.msg.guild?.channels.get(cid)).filter((c) => !!c);
    }
    return null;
  };

  const embed: Eris.Embed = {
    type: 'rich',
    color: con.color,
    author: {
      name: client.ch.stp(lan.author, { args }),
      icon_url: args.target.avatarURL,
      url: client.constants.standard.invite,
    },
    description: client.ch.stp(lan.description, {
      user: args.executor,
      args,
    }),
    footer: {
      text: client.ch.stp(lan.footer, {
        user: args.executor,
        args,
      }),
    },
    fields: [],
  };

  if (reason) embed.fields?.push({ name: language.reason, value: `${reason}` });

  if (args.duration) {
    embed.fields?.push({
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
    await client.ch.send(logchannels, { embeds: [embed] }, language, null, 10000);
  }
};

const loadingEmbed = (
  mExistedPreviously: boolean,
  language: Language,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];
  const con = client.constants.mod[args.type];

  if (!args.msg) return null;

  if (mExistedPreviously && args.source) {
    const embed = args.m?.embeds[0];
    if (!embed) return null;

    embed.fields?.pop();
    embed.color = con.color;
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.loading} ${lan.loading}`,
    });

    return embed;
  }
  if (mExistedPreviously) {
    const embed = args.m?.embeds[0];
    if (!embed) return null;

    embed.fields?.pop();
    embed.color = con.color;
    embed.description = `${client.stringEmotes.loading} ${lan.loading}`;

    return embed;
  }

  return {
    type: 'rich',
    color: con.color,
    description: `${client.stringEmotes.loading} ${lan.loading}`,
  };
};

const roleCheck = async (
  embed: Eris.Embed,
  mExistedPreviously: boolean,
  language: Language,
  targetMember: Eris.Member | null | undefined,
  executingMember: Eris.Member,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];

  if (args.forceFinish) return true;
  if (!executingMember || !targetMember || client.ch.isManageable(targetMember, executingMember)) {
    return true;
  }

  if (!args.msg) return false;
  if (!args.m) return false;

  if (mExistedPreviously && args.source) {
    embed.fields?.pop();
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.cross} ${lan.exeNoPerms}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.fields?.pop();
    embed.description = `${client.stringEmotes.cross} ${lan.exeNoPerms}`;

    deleter(args);
  } else {
    embed.description = `${client.stringEmotes.cross} ${lan.exeNoPerms}`;

    deleter(args);
  }

  await client.ch.edit(args.m, { embeds: [embed] });
  return false;
};

const checkSelfPunish = async (
  embed: Eris.Embed,
  mExistedPreviously: boolean,
  language: Language,
  targetMember: Eris.Member | null | undefined,
  executingMember: Eris.Member,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];

  if (args.forceFinish) return false;
  if (executingMember.id !== targetMember?.id) return false;
  if (!args.msg) return true;
  if (!args.m) return true;

  if (mExistedPreviously && args.source) {
    embed.fields?.pop();
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.cross} ${lan.selfPunish}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.fields?.pop();
    embed.description = `${client.stringEmotes.cross} ${lan.selfPunish}`;

    deleter(args);
  } else {
    embed.description = `${client.stringEmotes.cross} ${lan.selfPunish}`;

    deleter(args);
  }

  if (mExistedPreviously && args.m) {
    await client.ch.edit(args.m, { embeds: [embed] });
  }
  return true;
};

const checkMePunish = async (
  embed: Eris.Embed,
  mExistedPreviously: boolean,
  language: Language,
  targetMember: Eris.Member | null | undefined,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];

  if (args.forceFinish) return false;
  if (targetMember?.id !== client.user.id) return false;
  if (!args.msg) return true;
  if (!args.m) return true;

  if (mExistedPreviously && args.source) {
    embed.fields?.pop();
    embed.fields?.push({
      name: '\u200b',
      value: `${client.stringEmotes.cross} ${lan.mePunish}`,
    });

    deleter(args);
  } else if (mExistedPreviously) {
    embed.fields?.pop();
    embed.description = `${client.stringEmotes.cross} ${lan.mePunish}`;

    deleter(args);
  } else {
    embed.description = `${client.stringEmotes.cross} ${lan.mePunish}`;

    deleter(args);
  }

  if (args.m) await client.ch.edit(args.m, { embeds: [embed] });
  return true;
};

const checkPunishable = async (
  embed: Eris.Embed,
  mExistedPreviously: boolean,
  language: Language,
  targetMember: Eris.Member | null | undefined,
  punishmentType: CT.ModBaseEventOptions['type'],
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];

  switch (punishmentType) {
    case 'muteRemove':
    case 'tempmuteAdd': {
      if (isModeratable(targetMember)) {
        return true;
      }
      break;
    }
    case 'banAdd':
    case 'softbanAdd':
    case 'tempbanAdd': {
      if (isBannable(targetMember)) {
        return true;
      }
      break;
    }
    case 'channelbanAdd':
    case 'tempchannelbanAdd':
    case 'channelbanRemove': {
      if (!args.channel) throw new Error('Channel Missing');
      if (isManageable(args.channel) && targetMember) return true;
      break;
    }
    case 'banRemove': {
      if (isBannable(targetMember)) return true;
      break;
    }
    case 'kickAdd': {
      if (isKickable(targetMember)) return true;
      break;
    }
    case 'roleAdd': {
      if (client.ch.isManageable(targetMember, args.guild.members.get(client.user.id))) {
        return true;
      }
      break;
    }
    case 'roleRemove': {
      if (client.ch.isManageable(targetMember, args.guild.members.get(client.user.id))) {
        return true;
      }
      break;
    }
    default: {
      return true;
    }
  }

  if (args.forceFinish) return true;
  if (!args.msg) return false;

  if ('permissionError' in lan) {
    if (mExistedPreviously && args.source) {
      embed.fields?.pop();
      embed.fields?.push({
        name: '\u200b',
        value: `${client.stringEmotes.cross} ${lan.permissionError}`,
      });

      deleter(args);
    } else if (mExistedPreviously) {
      embed.fields?.pop();
      embed.description = `${client.stringEmotes.cross} ${lan.permissionError}`;

      deleter(args);
    } else {
      embed.description = `${client.stringEmotes.cross} ${lan.permissionError}`;

      deleter(args);
    }
  }

  if (args.m) await client.ch.edit(args.m, { embeds: [embed] });
  return false;
};

const doDM = async (
  language: Language,
  targetMember: Eris.Member | undefined | null,
  reason: string,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];
  const con = client.constants.mod[args.type];

  const dmChannel = await targetMember?.user.getDMChannel().catch(() => null);
  const DMembed: Eris.Embed = {
    type: 'rich',
    color: con.color,
    author: {
      name: client.ch.stp(lan.dm.author, { guild: args.guild, args }),
      url: `https://discord.com/users/${args.target.id}`,
    },
  };

  if (reason) DMembed.description = `**${language.reason}:** \n${reason}`;

  if (!dmChannel) return null;
  const m = await client.ch.send(dmChannel, { embeds: [DMembed] }, language);

  return m;
};

const checkActionTaken = async (
  embed: Eris.Embed,
  mExistedPreviously: boolean,
  language: Language,
  targetMember: Eris.Member | null | undefined,
  args: CT.ModBaseEventOptions,
) => {
  const lan = language.mod[args.type];
  let punished = false;

  switch (args.type) {
    case 'muteRemove': {
      punished = !(Number(targetMember?.communicationDisabledUntil) > Date.now());
      break;
    }
    case 'tempmuteAdd': {
      punished = Number(targetMember?.communicationDisabledUntil) > Date.now();
      break;
    }
    case 'banAdd':
    case 'softbanAdd':
    case 'tempbanAdd': {
      punished = !!(await args.guild.getBan(args.target.id).catch(() => null));
      break;
    }
    case 'channelbanAdd':
    case 'tempchannelbanAdd': {
      punished =
        new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(2048n) &&
        new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(274877906944n) &&
        new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(1024n) &&
        new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(64n) &&
        new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(1048576n);
      break;
    }
    case 'channelbanRemove': {
      punished =
        !new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(2048n) ||
        !new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(274877906944n) ||
        !new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(1024n) ||
        !new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(64n) ||
        !new Discord.PermissionsBitField(
          args.channel?.permissionOverwrites.get(args.target.id)?.deny,
        ).has(1048576n);
      break;
    }
    case 'banRemove': {
      punished = !(await args.guild?.getBan(args.target.id).catch(() => null));
      break;
    }
    case 'kickAdd': {
      punished = !args.guild?.members.get(args.target.id);
      break;
    }
    case 'roleAdd': {
      if (!args.role) throw new Error('No Role provided');
      punished = !!targetMember?.roles.includes(args.role.id);
      break;
    }
    case 'roleRemove': {
      if (!args.role) throw new Error('No Role provided');
      punished = !targetMember?.roles.includes(args.role.id);
      break;
    }
    default: {
      punished = false;
      break;
    }
  }

  if (args.forceFinish) return false;

  if (punished && 'alreadyApplied' in lan) {
    if (!args.msg) return true;

    if (mExistedPreviously && args.source) {
      embed.fields?.pop();
      embed.fields?.push({
        name: '\u200b',
        value: `${client.stringEmotes.cross} ${client.ch.stp(lan.alreadyApplied, {
          target: args.target,
          args,
        })}`,
      });

      deleter(args);
    } else if (mExistedPreviously) {
      embed.fields?.pop();
      embed.description = `${client.stringEmotes.cross} ${client.ch.stp(lan.alreadyApplied, {
        target: args.target,
        args,
      })}`;

      deleter(args);
    } else {
      embed.description = `${client.stringEmotes.cross} ${client.ch.stp(lan.alreadyApplied, {
        target: args.target,
        args,
      })}`;

      deleter(args);
    }

    if (args.m) await client.ch.edit(args.m, { embeds: [embed] });
    return true;
  }

  return false;
};

const takeAction = async (
  targetMember: Eris.Member | null | undefined,
  args: CT.ModBaseEventOptions,
  language: Language,
) => {
  let punished;
  let error;

  switch (args.type) {
    case 'muteRemove': {
      punished = await targetMember
        ?.edit(
          { communicationDisabledUntil: null },
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'tempmuteAdd': {
      if (!args.duration) throw new Error('No Duration provided');

      punished = await targetMember
        ?.edit(
          { communicationDisabledUntil: new Date(args.duration) },
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });

      client.mutes.set(
        `${args.guild.id}-${args.target.id}`,
        jobs.scheduleJob(
          `${args.guild.id}-${args.target.id}`,
          new Date(Date.now() + args.duration),
          () => {
            const options: CT.ModBaseEventOptions = {
              target: args.target,
              reason: language.events.ready.unmute,
              executor: client.user,
              msg: args.msg,
              guild: args.guild,
              forceFinish: true,
              doDBonly: true,
              type: 'muteRemove',
            };

            client.emit('modBaseEvent', options);
          },
        ),
      );
      break;
    }
    case 'banAdd': {
      punished = await args.guild
        .banMember(
          args.target.id,
          7,
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'softbanAdd': {
      punished = await args.guild
        ?.banMember(
          args.target.id,
          7,
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });

      if (!error) {
        punished = await args.guild
          .unbanMember(
            args.target.id,
            `${args.executor.username}#${args.executor.discriminator} ${
              args.reason ? `| ${args.reason}` : ''
            }`,
          )
          .catch((err) => {
            error = err;
          });
      }

      break;
    }
    case 'tempbanAdd': {
      punished = await args.guild
        ?.banMember(
          args.target.id,
          7,
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });

      client.bans.set(
        `${args.guild.id}-${args.target.id}`,
        jobs.scheduleJob(
          `${args.guild.id}-${args.target.id}`,
          new Date(Date.now() + Number(args.duration)),
          () => {
            const options: CT.ModBaseEventOptions = {
              target: args.target,
              reason: language.events.ready.unban,
              executor: client.user,
              msg: args.msg,
              guild: args.guild,
              forceFinish: true,
              type: 'banRemove',
            };

            client.emit('modBaseEvent', options);
          },
        ),
      );
      break;
    }
    case 'tempchannelbanAdd':
    case 'channelbanAdd': {
      if (!args.channel?.permissionOverwrites.has(args.target.id)) {
        const allowPerms = args.channel?.permissionOverwrites.get(args.target.id)?.allow
          ? new Discord.PermissionsBitField(
              args.channel?.permissionOverwrites.get(args.target.id)?.allow,
            )
          : new Discord.PermissionsBitField(0n);

        if (allowPerms) {
          allowPerms.remove(2048n);
          allowPerms.remove(274877906944n);
          allowPerms.remove(1024n);
          allowPerms.remove(64n);
          allowPerms.remove(1048576n);
        }

        punished = await args.channel
          ?.editPermission(
            args.target.id,
            allowPerms.bitfield,
            274878958656n,
            1,
            `${args.executor.username}#${args.executor.discriminator} ${
              args.reason ? `| ${args.reason}` : ''
            }`,
          )
          .catch((err) => {
            error = err;
          });
      }

      if (args.type === 'tempchannelbanAdd') {
        client.channelBans.set(
          `${args.channel?.id}-${args.target.id}`,
          jobs.scheduleJob(
            `${args.channel?.id}-${args.target.id}`,
            new Date(Date.now() + Number(args.duration)),
            () => {
              const options: CT.ModBaseEventOptions = {
                target: args.target,
                reason: language.events.ready.channelunban,
                executor: client.user,
                msg: args.msg,
                guild: args.guild,
                channel: args.channel,
                forceFinish: true,
                type: 'channelbanRemove',
              };

              client.emit('modBaseEvent', options);
            },
          ),
        );
      }
      break;
    }
    case 'channelbanRemove': {
      const denyPerms = args.channel?.permissionOverwrites.get(args.target.id)?.deny
        ? new Discord.PermissionsBitField(
            args.channel?.permissionOverwrites.get(args.target.id)?.deny,
          )
        : new Discord.PermissionsBitField(0n);

      if (denyPerms) {
        denyPerms.remove(2048n);
        denyPerms.remove(274877906944n);
        denyPerms.remove(1024n);
        denyPerms.remove(64n);
        denyPerms.remove(1048576n);
      }

      punished = await args.channel
        ?.editPermission(
          args.target.id,
          Number(args.channel?.permissionOverwrites.get(args.target.id)?.allow),
          denyPerms.bitfield,
          1,
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });

      if (punished && punished.deny === 0n && punished.allow === 0n) {
        punished = await args.channel
          ?.deletePermission(
            args.target.id,
            `${args.executor.username}#${args.executor.discriminator} ${
              args.reason ? `| ${args.reason}` : ''
            }`,
          )
          .catch((err) => {
            error = err;
          });
      }
      break;
    }
    case 'banRemove': {
      punished = await args.guild
        .unbanMember(
          args.target.id,
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'kickAdd': {
      punished = await targetMember
        ?.kick(
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'roleAdd': {
      if (!targetMember) throw new Error('No Member provided');
      if (!args.role) throw new Error('No Role provided');

      punished = client.ch.roleManager
        .add(
          targetMember,
          [args.role.id],
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
          error = err;
        });
      break;
    }
    case 'roleRemove': {
      if (!targetMember) throw new Error('No Member provided');
      if (!args.role) throw new Error('No Role provided');

      punished = client.ch.roleManager
        .remove(
          targetMember,
          [args.role.id],
          `${args.executor.username}#${args.executor.discriminator} ${
            args.reason ? `| ${args.reason}` : ''
          }`,
        )
        .catch((err) => {
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

const doDataBaseAction = async (args: CT.ModBaseEventOptions) => {
  const getAndDeleteRow = async (
    table: string,
    insertTable: string,
    extraSelectArgs: string[] | null,
    extraArgs: string[] | null,
    extraInsertArgNames: string[],
    extraInsertArgs?: string[],
  ) => {
    const selectArray = extraArgs
      ? [args.target.id, args.guild.id, ...extraArgs]
      : [args.target.id, args.guild.id];

    const rows = await client.ch.query(
      `SELECT * FROM ${table} WHERE userid = $1 AND guildid = $2 ${
        extraSelectArgs
          ? `${extraSelectArgs.map((arg, i) => `AND ${arg} = $${i + 3}`).join('')}`
          : ''
      }`,
      selectArray,
    );

    if (rows?.length) {
      await client.ch.query(
        `DELETE FROM ${table} WHERE userid = $1 AND guildid = $2 AND uniquetimestamp = $3;`,
        [args.target.id, args.guild.id, rows[0].uniquetimestamp],
      ); // js

      const [row] = rows;

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
      (${insertArgs ? `${insertArgs.map((_arg, i) => `$${i + 1}`).join(', ')}` : ''});`,
        insertArgs,
      );
      return row;
    }
    return null;
  };

  const insertRow = (table: string, extraArgNames?: string[], extraArgs?: string[]) => {
    const insertArgs = extraArgs
      ? [
          args.guild.id,
          args.target.id,
          args.reason,
          Date.now(),
          args.msg.channel.id,
          'name' in args.msg.channel ? args.msg.channel.name : 'None',
          args.executor.id,
          `${args.executor.username}#${args.executor.discriminator}`,
          args.msg.id,
          ...extraArgs,
        ]
      : [
          args.guild.id,
          args.target.id,
          args.reason,
          Date.now(),
          args.msg.channel.id,
          'name' in args.msg.channel ? args.msg.channel.name : 'None',
          args.executor.id,
          `${args.executor.username}#${args.executor.discriminator}`,
          args.msg.id,
        ];

    client.ch.query(
      `INSERT INTO ${table} (guildid, userid, reason, uniquetimestamp, channelid, channelname, executorid, executorname, msgid${
        extraArgNames ? `, ${extraArgNames.join(', ')}` : '' // `
      }) VALUES (
        ${insertArgs ? `${insertArgs.map((_arg, i) => `$${i + 1}`).join(', ')}` : ''});`,
      insertArgs,
    );
  };

  switch (args.type) {
    case 'muteRemove': {
      getAndDeleteRow('punish_tempmutes', 'punish_mutes', null, null, ['duration']);
      break;
    }
    case 'tempmuteAdd': {
      insertRow('punish_tempmutes', ['duration'], [String(args.duration)]);
      break;
    }
    case 'banAdd':
    case 'softbanAdd': {
      insertRow('punish_bans');
      break;
    }
    case 'tempbanAdd': {
      insertRow('punish_tempbans', ['duration'], [String(args.duration)]);
      break;
    }
    case 'channelbanAdd': {
      insertRow('punish_channelbans', ['banchannelid'], [String(args.channel?.id)]);
      break;
    }
    case 'tempchannelbanAdd': {
      insertRow(
        'punish_tempchannelbans',
        ['banchannelid', 'duration'],
        [String(args.channel?.id), String(args.duration)],
      );
      break;
    }
    case 'channelbanRemove': {
      getAndDeleteRow(
        'punish_tempchannelbans',
        'punish_channelbans',
        ['banchannelid'],
        [String(args.channel?.id)],
        ['banchannelid', 'duration'],
        [String(args.channel?.id)],
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

const deleter = (args: CT.ModBaseEventOptions) => {
  jobs.scheduleJob(new Date(Date.now() + 10000), () => {
    if (args.m) args.m.delete().catch(() => null);
    if (args.msg) args.msg.delete().catch(() => null);
  });
};

const isModeratable = (m: Eris.Member | undefined | null) =>
  !m ||
  (m.permissions.has(8n) &&
    client.ch.isManageable(m, m.guild.members.get(client.user.id)) &&
    m.guild.members.get(client.user.id)?.permissions.has(1099511627776n));

const isBannable = (m: Eris.Member | undefined | null) =>
  !m ||
  (client.ch.isManageable(m, m.guild.members.get(client.user.id)) &&
    m.guild.members.get(client.user.id)?.permissions.has(4n));

const isManageable = (c: Eris.AnyGuildChannel) => {
  if (client.user.id === c.guild.ownerID) return true;

  const me = c.guild.members.get(client.user.id);
  if (!me) return false;

  const permissions = c.permissionsOf(me);
  if (!permissions) return false;

  if (permissions.has(8n)) return true;
  if (Number(me.communicationDisabledUntil) > Date.now()) return false;

  const bitfield = c instanceof Eris.VoiceChannel ? 16n | 1048576n : 1024n | 1048576n;

  return permissions.has(bitfield);
};

const isKickable = (m: Eris.Member | null | undefined) =>
  m &&
  client.ch.isManageable(m, m.guild.members.get(client.user.id)) &&
  m.guild.members.get(client.user.id)?.permissions.has(2n);
