import type Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, invite: Eris.Invite) => {
  const channels = (
    await client.ch
      .query('SELECT inviteevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].inviteevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.inviteCreate;
  const con = client.constants.events.inviteCreate;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: invite.inviter ? `https://discord.com/users/${invite.inviter?.id}` : undefined,
    },
    color: con.color,
    description: invite.inviter
      ? client.ch.stp(lan.descDetails, { user: invite.inviter })
      : lan.desc,
    fields: [],
  });

  const embed = getEmbed();

  embed.fields?.push(
    {
      name: lan.channel,
      value: `<#${invite.channel.id}> / \`${invite.channel.name}\` / \`${invite.channel.id}\``,
      inline: false,
    },
    { name: lan.url, value: `https://discord.gg/${invite.code}`, inline: true },
    { name: lan.uses, value: String(invite.maxUses), inline: true },
  );

  if (invite.maxAge) {
    const expire = String(Date.now() + invite.maxAge).slice(0, -3);
    embed.fields?.push({
      name: lan.expires,
      value: `<t:${expire}:F> (<t:${expire}:R>)\n\`${moment
        .duration(invite.maxAge)
        .format(
          `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
          { trim: 'all' },
        )}\``,
    });
  }

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
