import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel,
) => {
  const channels = (
    await client.ch
      .query('SELECT channelevents FROM logchannels WHERE guildid = $1;', [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].channelevents : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);

  const lan = language.events.channelDelete;
  const con = client.constants.events.channelDelete;

  const getAuditLogEntry = async () => {
    if (!channel.guild.members.get(client.user.id)?.permissions.has(128n)) return null;

    const audits = await channel.guild.getAuditLog({ limit: 5, actionType: 10 });
    if (!audits || !audits.entries) return null;

    return audits.entries
      .filter((a) => a.targetID === channel.id)
      .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
  };

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      fields: [],
    };

    const audit = await getAuditLogEntry();
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        channel,
        type: language.channelTypes[channel.type],
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        channel,
        type: language.channelTypes[channel.type],
      });
    }

    const image = getImage(channel, con);

    embed.author = {
      name: client.ch.stp(lan.title, { type: language.channelTypes[channel.type] }),
      icon_url: image,
      url: `https://canary.discord.com/channels/${channel.guild.id}/${channel.id}`,
    };

    return embed;
  };

  const embed = await getEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getImage = (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel,
  con: typeof client.constants['events']['channelDelete'],
) => {
  switch (channel.type as number) {
    case 0: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWChannelDelete;
      if (channel.permissionOverwrites.size) return con.LockedChannelDelete;
      return con.TextChannelDelete;
    }
    case 2: {
      if (channel.permissionOverwrites.size) return con.LockedVoiceDelete;
      return con.VoiceDelete;
    }
    case 4: {
      return con.CategoryDelete;
    }
    case 5: {
      return con.NewsChannelDelete;
    }
    case 10: {
      return con.ThreadDelete;
    }
    case 11: {
      return con.ThreadDelete;
    }
    case 12: {
      return con.ThreadDelete;
    }
    case 13: {
      return con.StageDelete;
    }
    case 14: {
      return con.DirectoryDelete;
    }
    case 15: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWForumDelete;
      return con.ForumDelete;
    }
    default: {
      return con.TextChannelDelete;
    }
  }
};
