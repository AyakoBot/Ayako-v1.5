import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, role: Eris.Role) => {
  const channels = (
    await client.ch
      .query('SELECT roleevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].roleevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.roleRemove;
  const con = client.constants.events.roleRemove;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: role.iconURL || undefined },
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 32, role);
    if (role.managed && role.tags?.bot_id) {
      const manager = await client.ch.getUser(role.tags?.bot_id);
      if (manager && !(await client.ch.getMember(manager.id, guild.id))) {
        embed.description = client.ch.stp(lan.descDetails, {
          user: manager,
          role,
        });
      }

      if (audit?.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        role,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        role,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
    };

    return embed;
  };

  const embed = await getEmbed();
  if (!embed.description) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
