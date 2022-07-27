import * as Eris from 'eris';
import Discord from 'discord.js';
import moment from 'moment';
import 'moment-duration-format';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel
    | Eris.NewsThreadChannel
    | Eris.PrivateThreadChannel
    | Eris.PublicThreadChannel,
  oldChannel:
    | Eris.OldGuildChannel
    | Eris.OldGuildTextChannel
    | Eris.OldTextVoiceChannel
    | Eris.OldThread,
) => {
  const logType = [10, 11, 12].includes(channel.type) ? 'threadevents' : 'channelevents';

  const channels = (
    await client.ch
      .query(`SELECT ${logType} FROM logchannels WHERE guildid = $1;`, [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0][logType] : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);

  const lan = language.events.channelUpdate;
  const con = client.constants.events.channelUpdate;

  const getEmbed = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      fields: [],
    };

    const image = getImage(channel, con);

    embed.author = {
      name: client.ch.stp(lan.title, { type: language.channelTypes[channel.type] }),
      icon_url: image,
      url: `https://canary.discord.com/channels/${channel.guild.id}/${channel.id}`,
    };

    return embed;
  };

  const embed = getEmbed();
  const changedKeys: string[] = [];
  let actionType = 10;

  const bitrate = () => {
    if (!('bitrate' in channel)) return;
    if (!('bitrate' in oldChannel)) return;
    changedKeys.push('bitrate');

    embed.fields?.push({
      name: lan.bitrate,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: `${oldChannel.bitrate}kbps`,
        newValue: `${channel.bitrate}kbps`,
      }),
      inline: false,
    });
  };

  const parentID = () => {
    if (!('parentID' in channel)) return;
    if (!('parentID' in oldChannel)) return;
    changedKeys.push('parentID');

    let oldParentString: string;
    if (oldChannel.parentID) {
      const oldParent = channel.guild.channels.get(oldChannel.parentID);
      oldParentString = `<#${oldParent}> / \`${oldParent?.name}\` / \`${oldChannel.parentID}\``;
    } else oldParentString = language.none;

    let newParentString: string;
    if (channel.parentID) {
      const newParent = channel.guild.channels.get(channel.parentID);
      newParentString = `<#${newParent}> / \`${newParent?.name}\` / \`${oldChannel.parentID}\``;
    } else newParentString = language.none;

    embed.fields?.push({
      name: lan.parentID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldParentString,
        newValue: newParentString,
      }),
      inline: false,
    });
  };

  const permissionOverwrites = () => {
    if (!('permissionOverwrites' in channel)) return;
    if (!('permissionOverwrites' in oldChannel)) return;

    changedKeys.push('permissionOverwrites');
    const removedPerms = Array.from(oldChannel.permissionOverwrites.keys()).filter(
      (a1) => !Array.from(channel.permissionOverwrites.keys()).includes(a1),
    );
    const addedPerms = Array.from(channel.permissionOverwrites.keys()).filter(
      (a1) => !Array.from(oldChannel.permissionOverwrites.keys()).includes(a1),
    );

    const permRemoved = () => {
      changedKeys.push('permRemoved');
      const contents = removedPerms
        .map((pID) => {
          const perm = oldChannel.permissionOverwrites.get(pID);
          if (!perm) return null;

          return `${client.stringEmotes.crossWithBackground} ${
            perm.type === 0 ? `<@&${pID}>` : `<@${pID}>`
          }`;
        })
        .filter((p): p is string => !!p);

      if (!contents.length) return;
      embed.fields?.push({ name: lan.permRemoved, value: contents.join('\n'), inline: false });
    };

    const permAdded = () => {
      changedKeys.push('permAdded');
      const contents = addedPerms
        .map((pID) => {
          const perm = channel.permissionOverwrites.get(pID);
          if (!perm) return null;

          return `${client.stringEmotes.tickWithBackground} ${
            perm.type === 0 ? `<@&${pID}>` : `<@${pID}>`
          }`;
        })
        .filter((p): p is string => !!p);

      if (!contents.length) return;
      embed.fields?.push({ name: lan.permAdded, value: contents.join('\n'), inline: false });
    };

    const permUpdated = () => {
      changedKeys.push('permUpdated');
      const updatedPerms = channel.permissionOverwrites.filter((a1) =>
        oldChannel.permissionOverwrites.some(
          (a2) =>
            (a1.id === a2.id && a1.allow !== a2.allow) || (a1.id === a2.id && a1.deny !== a2.deny),
        ),
      );

      updatedPerms.forEach((perm) => {
        const oldPerms = oldChannel.permissionOverwrites.get(perm.id);
        if (!oldPerms) return;
        const newPerms = channel.permissionOverwrites.get(perm.id);
        if (!newPerms) return;

        const [diffDeny1, deniedPerms] = client.ch.bitUniques(oldPerms?.deny, newPerms?.deny);
        const [diffAllow1, allowedPerms] = client.ch.bitUniques(oldPerms?.allow, newPerms?.allow);
        const nulledPerms = new Discord.PermissionsBitField(diffDeny1)
          .add([...new Discord.PermissionsBitField(diffAllow1)])
          .remove([...new Discord.PermissionsBitField(deniedPerms)])
          .remove([...new Discord.PermissionsBitField(allowedPerms)]).bitfield;

        const deniedContent = Object.entries(new Eris.Permission(deniedPerms).json)
          .map(([name, enabled]) =>
            enabled
              ? `${perm.type === 0 ? `<@&${perm.id}>` : `<@${perm.id}>`} \`${
                  language.permissions.perms[name as keyof typeof language.permissions.perms]
                }\``
              : null,
          )
          .filter((s): s is string => !!s);
        const allowedContent = Object.entries(new Eris.Permission(allowedPerms).json)
          .map(([name, enabled]) =>
            enabled
              ? `${perm.type === 0 ? `<@&${perm.id}>` : `<@${perm.id}>`} \`${
                  language.permissions.perms[name as keyof typeof language.permissions.perms]
                }\``
              : null,
          )
          .filter((s): s is string => !!s);
        const nulledContent = Object.entries(new Eris.Permission(nulledPerms).json)
          .map(([name, enabled]) =>
            enabled
              ? `${perm.type === 0 ? `<@&${perm.id}>` : `<@${perm.id}>`} \`${
                  language.permissions.perms[name as keyof typeof language.permissions.perms]
                }\``
              : null,
          )
          .filter((s): s is string => !!s);

        if (deniedContent.length) {
          embed.fields?.push({
            name: `${client.stringEmotes.switch.disable} ${lan.disabled}`,
            value: deniedContent.join('\n'),
            inline: false,
          });
        }
        if (allowedContent.length) {
          embed.fields?.push({
            name: `${client.stringEmotes.switch.enable} ${lan.granted}`,
            value: allowedContent.join('\n'),
            inline: false,
          });
        }
        if (nulledContent.length) {
          embed.fields?.push({
            name: `${client.stringEmotes.switch.neutral} ${lan.revoked}`,
            value: nulledContent.join('\n'),
            inline: false,
          });
        }
      });
    };

    switch (true) {
      case !!removedPerms.length: {
        actionType = 15;
        permRemoved();
        break;
      }
      case !!addedPerms.length: {
        actionType = 13;
        permAdded();
        break;
      }
      default: {
        actionType = 14;
        permUpdated();
        break;
      }
    }
  };

  const basic = (
    key:
      | 'name'
      | 'nsfw'
      | 'rateLimitPerUser'
      | 'rtcRegion'
      | 'topic'
      | 'type'
      | 'userLimit'
      | 'videoQualityMode',
  ) => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldChannel[key as never] || language.none,
        newValue: channel[key as never] || language.none,
      }),
      inline: false,
    });
  };

  const threadBasic = (
    key: 'archived' | 'locked',
    data: Eris.ThreadMetadata,
    oldData: Eris.OldThread['threadMetadata'],
  ) => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldData[key as never] || language.none,
        newValue: data[key as never] || language.none,
      }),
      inline: false,
    });
  };

  const autoArchiveDuration = (
    data: Eris.ThreadMetadata,
    oldData: Eris.OldThread['threadMetadata'],
  ) => {
    changedKeys.push('autoArchiveDuration');
    embed.fields?.push({
      name: lan.autoArchiveDuration,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldData.autoArchiveDuration
          ? `<t:${String(oldData.autoArchiveDuration * 1000 + Date.now()).slice(
              0,
              -3,
            )}:F> (<t:${String(oldData.autoArchiveDuration * 1000 + Date.now()).slice(
              0,
              -3,
            )}:R>)\n\`${moment
              .duration(oldData.autoArchiveDuration)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              )}\``
          : language.none,
        newValue: data.autoArchiveDuration
          ? `<t:${String(data.autoArchiveDuration * 1000 + Date.now()).slice(
              0,
              -3,
            )}:F> (<t:${String(data.autoArchiveDuration * 1000 + Date.now()).slice(
              0,
              -3,
            )}:R>)\n\`${moment
              .duration(data.autoArchiveDuration)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              )}\``
          : language.none,
      }),
      inline: false,
    });
  };

  switch (true) {
    case 'bitrate' in channel &&
      'bitrate' in oldChannel &&
      channel.bitrate !== oldChannel.bitrate: {
      bitrate();
      break;
    }
    case channel.name !== oldChannel.name: {
      basic('name');
      break;
    }
    case 'nsfw' in oldChannel && channel.nsfw !== oldChannel.nsfw: {
      basic('nsfw');
      break;
    }
    case 'parentID' in oldChannel && channel.parentID !== oldChannel.parentID: {
      parentID();
      break;
    }
    case 'permissionOverwrites' in oldChannel &&
      channel.permissionOverwrites
        .map((o) => o)
        .sort((a, b) => client.ch.getUnix(a.id) - client.ch.getUnix(b.id))
        .join(' ') !==
        oldChannel.permissionOverwrites
          .map((o) => o)
          .sort((a, b) => client.ch.getUnix(a.id) - client.ch.getUnix(b.id))
          .join(' '): {
      permissionOverwrites();
      break;
    }
    case 'rateLimitPerUser' in channel &&
      channel.rateLimitPerUser !== oldChannel.rateLimitPerUser: {
      basic('rateLimitPerUser');
      break;
    }
    case 'rtcRegion' in channel &&
      'rtcRegion' in oldChannel &&
      channel.rtcRegion !== oldChannel.rtcRegion: {
      basic('rtcRegion');
      break;
    }
    case 'topic' in channel && 'topic' in oldChannel && channel.topic !== oldChannel.topic: {
      basic('topic');
      break;
    }
    case 'type' in channel && 'type' in oldChannel && channel.type !== oldChannel.type: {
      basic('type');
      break;
    }
    case 'userLimit' in channel &&
      'userLimit' in oldChannel &&
      channel.userLimit !== oldChannel.userLimit: {
      basic('userLimit');
      break;
    }
    case 'videoQualityMode' in channel &&
      'videoQualityMode' in oldChannel &&
      channel.videoQualityMode !== oldChannel.videoQualityMode: {
      basic('videoQualityMode');
      break;
    }
    case 'threadMetadata' in channel && 'threadMetadata' in oldChannel: {
      if (!('threadMetadata' in channel)) return;
      if (!('threadMetadata' in oldChannel)) return;

      actionType = 111;

      const oldData = oldChannel.threadMetadata;
      const data = channel.threadMetadata;
      switch (true) {
        case oldData.autoArchiveDuration !== data.autoArchiveDuration: {
          autoArchiveDuration(data, oldData);
          break;
        }
        case oldData.archived !== data.archived: {
          threadBasic('archived', data, oldData);
          break;
        }
        case oldData.locked !== data.locked: {
          threadBasic('locked', data, oldData);
          break;
        }
        default: {
          break;
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  const audit = await client.ch.getAudit(channel.guild, actionType, channel);
  if (audit) {
    embed.description = client.ch.stp(lan.descDetails, {
      user: audit.user,
      type: language.channelTypes[channel.type],
      channel,
    });

    if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
  } else {
    embed.description = client.ch.stp(lan.desc, {
      type: language.channelTypes[channel.type],
      channel,
    });
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 1000);
};

const getImage = (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel,
  con: typeof client.constants['events']['channelUpdate'],
) => {
  switch (channel.type as number) {
    case 0: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWChannelUpdate;
      if (channel.permissionOverwrites.size) return con.LockedChannelUpdate;
      return con.TextChannelUpdate;
    }
    case 2: {
      if (channel.permissionOverwrites.size) return con.LockedVoiceUpdate;
      return con.VoiceUpdate;
    }
    case 4: {
      return con.CategoryUpdate;
    }
    case 5: {
      return con.NewsChannelUpdate;
    }
    case 10: {
      return con.ThreadUpdate;
    }
    case 11: {
      return con.ThreadUpdate;
    }
    case 12: {
      return con.ThreadUpdate;
    }
    case 13: {
      return con.StageUpdate;
    }
    case 14: {
      return con.DirectoryUpdate;
    }
    case 15: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWForumUpdate;
      return con.ForumUpdate;
    }
    default: {
      return con.TextChannelUpdate;
    }
  }
};
