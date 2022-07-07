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
    | Eris.GuildChannel
    | Eris.NewsThreadChannel
    | Eris.PrivateThreadChannel
    | Eris.PublicThreadChannel,
) => {
  const channels = (
    await client.ch
      .query('SELECT channelevents FROM logchannels WHERE guildid = $1;', [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].channelevents : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);
  const actionType = [10, 11, 12].includes(channel.type) ? 110 : 10;

  const lan = language.events.channelCreate;
  const con = client.constants.events.channelCreate;

  const getAuditLogEntry = async () => {
    if (!channel.guild.members.get(client.user.id)?.permissions.has(128n)) return null;

    const audits = await channel.guild.getAuditLog({ limit: 5, actionType });
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
  con: typeof client.constants['events']['channelCreate'],
) => {
  switch (channel.type as number) {
    case 0: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWChannelCreate;
      if (channel.permissionOverwrites.size) return con.LockedChannelCreate;
      return con.TextChannelCreate;
    }
    case 2: {
      if (channel.permissionOverwrites.size) return con.LockedVoiceCreate;
      return con.VoiceCreate;
    }
    case 4: {
      return con.CategoryCreate;
    }
    case 5: {
      return con.NewsChannelCreate;
    }
    case 10: {
      return con.ThreadCreate;
    }
    case 11: {
      return con.ThreadCreate;
    }
    case 12: {
      return con.ThreadCreate;
    }
    case 13: {
      return con.StageCreate;
    }
    case 14: {
      return con.DirectoryCreate;
    }
    case 15: {
      if ('nsfw' in channel && channel.nsfw) return con.NSFWForumCreate;
      return con.ForumCreate;
    }
    default: {
      return con.TextChannelCreate;
    }
  }
};
