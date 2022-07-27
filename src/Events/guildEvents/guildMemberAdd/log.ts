import type Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const channels = (
    await client.ch
      .query('SELECT guildmemberevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].guildmemberevents : null))
  )?.map((id: string) => guild?.channels.get(id));

  if (!channels) return;

  const lan = language.events.guildMemberAdd;
  const con = client.constants.events.guildMemberAdd;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: { name: 'placeholder', url: `https://discord.com/users/${member.user.id}` },
    thumbnail: { url: member.avatarURL },
    color: con.color,
    fields: [
      {
        name: language.createdAt,
        value: `<t:${`${member.user.createdAt}`.slice(
          0,
          -3,
        )}> <t:${`${member.user.createdAt}`.slice(0, -3)}:R>\n(\`${client.ch.stp(
          language.time.timeAgo,
          {
            time: moment
              .duration(Date.now() - member.user.createdAt)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              ),
          },
        )}\`)`,
      },
    ],
  });

  const getBotEmbed = async (): Promise<Eris.Embed> => {
    const baseEmbed = getEmbed();
    const audit = await client.ch.getAudit(guild, 28, member.user);

    if (baseEmbed.author) {
      baseEmbed.author.name = lan.titleBot;
      baseEmbed.author.icon_url = con.BotCreate;
    }

    if (audit) {
      baseEmbed.description = client.ch.stp(lan.descriptionBot, {
        user: audit.user,
        bot: member.user,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      baseEmbed.description = client.ch.stp(lan.descriptionBotNoAudit, {
        bot: member.user,
      });
    }

    return baseEmbed;
  };

  const getUserEmbed = async (): Promise<Eris.Embed> => {
    const baseEmbed = getEmbed();

    if (baseEmbed.author) {
      baseEmbed.author.name = lan.titleUser;
      baseEmbed.author.icon_url = con.MemberCreate;
    }

    const newInvites = await client.ch.getAllInvites(guild);
    const usedInvite = client.invites
      .get(guild.id)
      ?.find(
        (cachedInv) =>
          newInvites &&
          newInvites.some(
            (fetchedInv) => cachedInv.code === fetchedInv.code && cachedInv.uses < fetchedInv.uses,
          ),
      );

    baseEmbed.description = client.ch.stp(lan.descriptionUser, {
      user: member.user,
      invite: usedInvite,
    });

    if (usedInvite) {
      if (!baseEmbed.fields) baseEmbed.fields = [];

      let mention: string;
      let tag: string;
      let id: string;

      if (!usedInvite.inviter) {
        tag = language.unknown;
        mention = language.unknown;
        id = language.unknown;
      } else if (usedInvite.inviter.id === guild.id) {
        tag = guild.name;
        mention = guild.name;
        id = guild.id;
      } else {
        tag = `${usedInvite.inviter.username}#${usedInvite.inviter.discriminator}`;
        mention = `<@${usedInvite.inviter.id}>`;
        id = usedInvite.inviter.id;
      }

      baseEmbed.fields?.push({
        name: lan.usedInvite,
        value: client.ch.stp(lan.inviteInfo, { invite: usedInvite, tag, mention, id }),
        inline: false,
      });
    }

    return baseEmbed;
  };

  const embed = member.user.bot ? await getBotEmbed() : await getUserEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
