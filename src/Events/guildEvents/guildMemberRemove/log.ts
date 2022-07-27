import type Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, member: Eris.Member | { id: string; user: Eris.User }) => {
  const channels = (
    await client.ch
      .query('SELECT guildmemberevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].guildmemberevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.guildMemberRemove;
  const con = client.constants.events.guildMemberRemove;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: member.user.avatarURL },
    };

    const finishedRoles =
      'roles' in member
        ? member.roles
            .sort(
              (a, b) => Number(guild.roles.get(a)?.position) - Number(guild.roles.get(b)?.position),
            )
            .map((r) => `<@&${r}>`)
        : [];
    const chunks = chunker(finishedRoles, 37);

    embed.fields = chunks.map((c) => ({
      name: language.roles,
      value: c.join(' '),
      inline: false,
    }));

    const audit = await client.ch.getAudit(guild, 20, member.user);
    if (audit) {
      embed.description = client.ch.stp(lan.descriptionKicked, {
        user: audit.user,
        target: member.user,
      });

      embed.author = {
        name: lan.nameKick,
        icon_url: member.user.bot ? con.BotDelete : con.MemberDelete,
        url: `https://discord.com/users/${member.user.id}`,
      };

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.descriptionLeft, {
        user: member.user,
      });

      embed.author = {
        name: lan.nameLeave,
        icon_url: member.user.bot ? con.BotDelete : con.MemberDelete,
        url: `https://discord.com/users/${member.user.id}`,
      };
    }

    if ('joinedAt' in member) {
      embed.fields?.push({
        name: language.joinedAt,
        value: `<t:${String(member.joinedAt).slice(0, -3)}> <t:${String(member.joinedAt).slice(
          0,
          -3,
        )}:R>\n\`${client.ch.stp(language.time.timeAgo, {
          time: moment
            .duration(Math.abs(Date.now() - Number(member.joinedAt)))
            .format(
              `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
              { trim: 'all' },
            ),
        })}\``,
      });
    }

    return embed;
  };

  const embed = await getEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const chunker = (arr: string[], len: number) => {
  let chunks = [];
  let i = 0;
  while (i < arr.length) chunks.push(arr.slice(i, (i += len)));
  chunks = chunks.map((o) => o);
  return chunks;
};
