import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  guild: Eris.Guild,
  member: Eris.Member,
  oldMember: Eris.OldMember | { user: Eris.User; id: string },
  language: typeof import('../../../Languages/en.json'),
) => {
  if ('premiumSince' in oldMember && oldMember.premiumSince && member.premiumSince) return;

  const channels = (
    await client.ch
      .query('SELECT logchannels FROM nitrosettings WHERE guildid = $1;', [guild.id])
      .then((r: DBT.nitrosettings[] | null) => (r ? r[0].logchannels : null))
  )?.map((id: string) => guild?.channels.get(id));
  if (!channels) return;

  if (member.premiumSince && !('premiumSince' in oldMember && oldMember.premiumSince)) {
    const startedBoostRows = await getStartedBoost(member);
    if (startedBoostRows) return;
    startedBoost(member, guild);
    logStart(member, language, channels);
  }

  if ('premiumSince' in oldMember && oldMember.premiumSince && !member.premiumSince) {
    stoppedBoost(member, guild);
    logEnd(member, language, channels);
  }
};

const getStartedBoost = async (member: Eris.Member) =>
  client.ch
    .query(`SELECT * FROM nitrousers WHERE userid = $1 AND booststart = $2;`, [
      member.user.id,
      member.premiumSince,
    ])
    .then((r: DBT.nitrousers[] | null) => (r ? r[0] : null));

const startedBoost = (member: Eris.Member, guild: Eris.Guild) =>
  client.ch.query(`INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3);`, [
    guild.id,
    member.user.id,
    member.premiumSince,
  ]);

const stoppedBoost = (member: Eris.Member, guild: Eris.Guild) =>
  client.ch.query(
    `UPDATE nitrousers SET boostend = $1 WHERE userid = $2 AND guildid = $3 AND boostend IS NULL AND booststart = $4;`,
    [Date.now(), member.user.id, guild.id, member.premiumSince],
  );

const logEnd = async (
  member: Eris.Member,
  language: typeof import('../../../Languages/en.json'),
  channels: (Eris.AnyGuildChannel | undefined)[],
) => {
  const embed = getEmbed(member);

  embed.description = client.ch.stp(language.events.guildMemberUpdate.descriptionBoostingEnd, {
    user: member.user,
  });

  if (embed.author?.name) embed.author.name = language.events.guildMemberUpdate.boostingEnd;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const logStart = async (
  member: Eris.Member,
  language: typeof import('../../../Languages/en.json'),
  channels: (Eris.AnyGuildChannel | undefined)[],
) => {
  const embed = getEmbed(member);

  embed.description = client.ch.stp(language.events.guildMemberUpdate.descriptionBoostingStart, {
    user: member.user,
  });

  if (embed.author?.name) embed.author.name = language.events.guildMemberUpdate.boostingStart;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getEmbed = (member: Eris.Member): Eris.Embed => ({
  type: 'rich',
  author: {
    name: 'placeholder',
    icon_url: client.constants.events.guildMemberUpdate.image,
    url: `https://discord.com/users/${member.user.id}`,
  },
  thumbnail: {
    url: member.avatarURL || member.user.avatarURL,
  },
  color: client.constants.events.guildMemberUpdate.color,
});
