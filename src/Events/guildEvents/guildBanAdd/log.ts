import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, user: Eris.User) => {
  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.guildBanAdd;
  const con = client.constants.events.guildBanAdd;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: user.avatarURL },
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 22, user);
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        target: user,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        user,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${user.id}`,
    };

    return embed;
  };

  const embed = await getEmbed();

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
