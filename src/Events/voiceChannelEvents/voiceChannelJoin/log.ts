import type * as Eris from 'eris';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (member: Eris.Member, channel: Eris.TextVoiceChannel | Eris.StageChannel) => {
  const channels = (
    await client.ch
      .query('SELECT voiceevents FROM logchannels WHERE guildid = $1;', [member.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].voiceevents : null))
  )?.map((id: string) => member.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(member.guild.id);
  const lan = language.events.voiceChannelJoin;
  const con = client.constants.events.voiceChannelJoin;
  const image = getImage(channel, con);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: client.ch.stp(lan.title, { type: language.channelTypes[channel.type] }),
      icon_url: image,
      url: `https://discord.com/users/${member.user.id}`,
    },
    color: con.color,
    description: client.ch.stp(lan.desc, {
      member,
      type: language.channelTypes[channel.type],
      channel,
    }),
  });

  const embed = getEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getImage = (
  channel: Eris.TextVoiceChannel | Eris.StageChannel,
  con: typeof client.constants['events']['voiceChannelJoin'],
) => {
  switch (channel.type as number) {
    case 2: {
      if (channel.permissionOverwrites.size) return con.LockedVoiceCreate;
      return con.VoiceCreate;
    }
    case 13: {
      return con.StageCreate;
    }
    default: {
      return con.VoiceCreate;
    }
  }
};
