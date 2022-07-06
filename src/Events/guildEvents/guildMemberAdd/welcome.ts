import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const welcomeRow = await client.ch
    .query(`SELECT * FROM welcome WHERE guildid = $1 AND active = true;`, [guild.id])
    .then((r: DBT.welcome[] | null) => (r ? r[0] : null));
  if (!welcomeRow) return;
  if (!welcomeRow.channelid) return;

  const channel = guild.channels.get(welcomeRow.channelid);
  if (!channel) return;

  const embed = await getEmbed(welcomeRow, member, guild);
  if (!embed) return;

  let content = '';

  if (welcomeRow.pingroles && welcomeRow.pingroles.length) {
    content += welcomeRow.pingroles.map((id) => `<@&${id}>`).join(' ');
    content += '\n';
  }
  if (welcomeRow.pingusers && welcomeRow.pingusers.length) {
    content += welcomeRow.pingusers.map((id) => `<@${id}>`).join(' ');
  }

  client.ch.send(
    channel,
    {
      embeds: [embed],
      content: content.length ? content : undefined,
    },
    language,
    null,
    5000,
  );
};

const getEmbed = async (welcomeRow: DBT.welcome, member: Eris.Member, guild: Eris.Guild) => {
  const getDefaultEmbed = async (): Promise<Eris.Embed> => {
    const language = await client.ch.languageSelector(guild.id);

    return {
      type: 'rich',
      description: language.welcome.author,
      color: client.ch.colorSelector(member),
    };
  };

  const options = [
    ['member', member],
    ['username', member.user.username],
    ['usertag', `${member.user.username}#${member.user.discriminator}`],
    ['user', member.user],
    ['serverName', guild.name],
  ];

  if (!welcomeRow.embed) return client.ch.dynamicToEmbed(await getDefaultEmbed(), options);

  const customembedsRow = await client.ch
    .query(`SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`, [
      welcomeRow.embed,
      guild.id,
    ])
    .then((r: DBT.customembeds[] | null) => (r ? r[0] : null));

  let embed;

  if (customembedsRow) {
    const partialEmbed = client.ch.getDiscordEmbed(customembedsRow);
    embed = client.ch.dynamicToEmbed(partialEmbed, options);
  } else {
    embed = client.ch.dynamicToEmbed(await getDefaultEmbed(), options);
  }

  return embed;
};
