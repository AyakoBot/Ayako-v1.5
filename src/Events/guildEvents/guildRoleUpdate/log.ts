import Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole) => {
  const channels = (
    await client.ch
      .query('SELECT roleevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].roleevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.roleUpdate;
  const con = client.constants.events.roleUpdate;

  const getAuditLogEntry = async () => {
    if (!guild.members.get(client.user.id)?.permissions.has(128n)) return null;

    const audits = await guild.getAuditLog({ limit: 5, actionType: 31 });
    if (!audits || !audits.entries) return null;

    return audits.entries
      .filter((a) => a.targetID === role.id)
      .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
  };

  const audit = await getAuditLogEntry();

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
    },
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, { user: audit.user, role })
      : client.ch.stp(lan.desc, { role }),
    fields: [],
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];
  const files: Eris.FileContent[] = [];

  const icon = async () => {
    changedKeys.push('icon');
    const oldIcon = oldRole.icon
      ? client.ch.stp(client.constants.standard.roleIconURL, {
          guild,
          role,
        })
      : null;
    const newIcon = guild.icon
      ? client.ch.stp(client.constants.standard.roleIconURL, {
          role,
          guild,
        })
      : null;

    const [oldIconFile, newIconFile] = await client.ch.fileURL2Buffer([oldIcon, newIcon]);

    if (oldIconFile) {
      oldIconFile.name = `${oldRole.icon}.png`;
      embed.thumbnail = {
        url: `attachment://${oldRole.icon}.png`,
      };
      files.push(oldIconFile);
    }
    if (newIconFile) {
      newIconFile.name = `${role.icon}.png`;
      embed.image = {
        url: `attachment://${role.icon}.png`,
      };
      files.push(newIconFile);
    }

    if (oldIconFile || newIconFile) {
      embed.fields?.push({
        name: lan.icon,
        value: lan.iconAppear,
        inline: false,
      });
    }
  };

  const basic = (key: 'color' | 'hoist' | 'mentionable' | 'name' | 'unicodeEmoji') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldRole[key] || language.none,
        newValue: role[key] || language.none,
      }),
      inline: false,
    });
  };

  const permissions = () => {
    changedKeys.push('permissions');
    const all = Object.keys(new Eris.Permission(Eris.Constants.Permissions.all).json);
    const oldAllowed = Object.entries(oldRole.permissions.json)
      .filter((e) => e[1] === true)
      .map((e) => e[0]);
    const oldDenied = Object.entries(oldRole.permissions.json)
      .filter((e) => e[1] === false)
      .map((e) => e[0]);
    const newAllowed = Object.entries(role.permissions.json)
      .filter((e) => e[1] === true)
      .map((e) => e[0]);
    const newDenied = Object.entries(role.permissions.json)
      .filter((e) => e[1] === false)
      .map((e) => e[0]);
    const updatedAllowed = all.filter((o) => !oldAllowed.includes(o) && newAllowed.includes(o));
    const updatedDenied = all.filter((o) => !oldDenied.includes(o) && newDenied.includes(o));

    const allowedContent: string[] = [];
    updatedAllowed.forEach((perm) => {
      allowedContent.push(
        `${language.permissions.perms[perm as keyof typeof language.permissions.perms]}`,
      );
    });

    const deniedContent: string[] = [];
    updatedDenied.forEach((perm) => {
      deniedContent.push(
        `${language.permissions.perms[perm as keyof typeof language.permissions.perms]}`,
      );
    });

    if (allowedContent.length) {
      embed.fields?.push({
        name: `${client.stringEmotes.enabled} ${lan.allowedPerms}`,
        value: allowedContent.join('\n'),
      });
    }

    if (deniedContent.length) {
      embed.fields?.push({
        name: `${client.stringEmotes.disabled} ${lan.deniedPerms}`,
        value: deniedContent.join('\n'),
      });
    }
  };

  switch (true) {
    case role.color !== oldRole.color: {
      basic('color');
      break;
    }
    case role.hoist !== oldRole.hoist: {
      basic('hoist');
      break;
    }
    case role.icon !== oldRole.icon: {
      icon();
      break;
    }
    case role.mentionable !== oldRole.mentionable: {
      basic('mentionable');
      break;
    }
    case role.name !== oldRole.name: {
      basic('name');
      break;
    }
    case JSON.stringify(role.permissions) !== JSON.stringify(oldRole.permissions): {
      permissions();
      break;
    }
    case role.position !== oldRole.position: {
      // we dont do that here
      break;
    }
    case role.unicodeEmoji !== oldRole.unicodeEmoji: {
      basic('unicodeEmoji');
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed], files }, language, null, 10000);
};
