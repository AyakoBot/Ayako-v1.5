import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  channel: Eris.NewsThreadChannel | Eris.PrivateThreadChannel | Eris.PublicThreadChannel,
  addedUsers: Eris.User[],
  removedUsers: Eris.User[],
) => {
  const logType = [10, 11, 12].includes(channel.type) ? 'threadevents' : 'channelevents';

  const channels = (
    await client.ch
      .query(`SELECT ${logType} FROM logchannels WHERE guildid = $1;`, [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0][logType] : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);

  const lan = language.events.threadMembersUpdate;
  const con = client.constants.events.threadMembersUpdate;

  const getEmbed = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: client.ch.stp(lan.title, { type: language.channelTypes[channel.type] }),
        icon_url: con.image,
        url: `https://canary.discord.com/channels/${channel.guild.id}/${channel.id}`,
      },
      color: con.color,
      fields: [],
    };

    if (addedUsers.length) {
      embed.fields?.push({
        name: lan.joined,
        value: addedUsers
          .map(
            (user) => `<@${user.id}> / \`${user.username}#${user.discriminator}\` / \`${user.id}\``,
          )
          .join('\n'),
      });
    }

    if (removedUsers.length) {
      embed.fields?.push({
        name: lan.joined,
        value: removedUsers
          .map(
            (user) => `<@${user.id}> / \`${user.username}#${user.discriminator}\` / \`${user.id}\``,
          )
          .join('\n'),
      });
    }

    return embed;
  };

  const embed = getEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
