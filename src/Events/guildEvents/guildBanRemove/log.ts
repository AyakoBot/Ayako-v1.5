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

  const lan = language.events.guildBanRemove;
  const con = client.constants.events.guildBanRemove;

  const getAuditLogEntry = async () => {
    if (!guild.members.get(client.user.id)?.permissions.has(128n)) return null;

    const audits = await guild.getAuditLog({ limit: 5, actionType: 22 });
    if (!audits || !audits.entries) return null;

    return audits.entries
      .filter((a) => a.targetID === user.id)
      .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
  };

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: user.avatarURL },
      fields: [],
    };

    const audit = await getAuditLogEntry();
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
