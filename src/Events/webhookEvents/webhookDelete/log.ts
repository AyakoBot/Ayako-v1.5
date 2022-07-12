import type * as Eris from 'eris';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  channel: Eris.GuildTextableChannel,
  webhook: Eris.Webhook,
  audit: Eris.GuildAuditLogEntry,
) => {
  const channels = (
    await client.ch
      .query('SELECT voiceevents FROM logchannels WHERE guildid = $1;', [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].voiceevents : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);
  const lan = language.events.webhookDelete;
  const con = client.constants.events.webhookDelete;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${webhook.id}`,
    },
    color: con.color,
    description: client.ch.stp(lan.desc, {
      webhook,
      user: audit.user,
      type: language.channelTypes[channel.type],
      channel,
    }),
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
