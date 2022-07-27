import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (stage: Eris.StageInstance) => {
  const guild = client.guilds.get(stage.guild.id);
  if (!guild) return;

  const channels = (
    await client.ch
      .query('SELECT stageevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].stageevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);
  const lan = language.events.stageClose;
  const con = client.constants.events.stageClose;
  const audit = await client.ch.getAudit(guild, 85);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/channels/${guild.id}/${stage.channel.id}`,
    },
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, { user: audit.user, channel: stage.channel })
      : client.ch.stp(lan.desc, { channel: stage.channel }),
    fields: [],
  });

  const embed = getEmbed();

  if (audit && audit.reason) {
    embed.fields?.push({ name: language.reason, value: audit.reason, inline: false });
  }

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
