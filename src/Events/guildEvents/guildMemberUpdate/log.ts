import type Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  guild: Eris.Guild,
  member: Eris.Member,
  oldMember: Eris.OldMember | { user: Eris.User; id: string },
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const channels = (
    await client.ch
      .query('SELECT guildmemberevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].guildmemberevents : null))
  )?.map((id: string) => guild?.channels.get(id));

  if (!channels) return;

  const lan = language.events.guildMemberUpdate;
  const con = client.constants.events.guildMemberUpdate;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${member.user.id}`,
    },
    thumbnail: {
      url: member.avatarURL || member.user.avatarURL,
    },
    fields: [],
    color: con.color,
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];
  const descriptions: string[] = [];

  const roleUpdate = async () => {
    if (!('roles' in oldMember)) return;
    changedKeys.push('roles');

    const updatedRoles = oldMember.roles.filter((a1) => !member.roles.includes(a1));
    const removedRoles = updatedRoles.filter((a1) => !member.roles.includes(a1));
    const addedRoles = updatedRoles.filter((a1) => member.roles.includes(a1));

    const removedContent = removedRoles
      .map((r) => `${client.stringEmotes.minusBG} <@&${r}>`)
      .join('\n');
    const addedContent = addedRoles.map((r) => `${client.stringEmotes.plusBG} <@&${r}>`).join('\n');

    if (removedContent) {
      embed.fields?.push({
        name: lan.removed,
        value: removedContent,
        inline: false,
      });
    }
    if (addedContent) {
      embed.fields?.push({
        name: lan.removed,
        value: addedContent,
        inline: false,
      });
    }

    const audit = await getAudit(guild, member, 25);

    if (audit) {
      descriptions.push(
        client.ch.stp(lan.descriptionRoles, {
          user: audit.user,
          target: member.user,
        }),
      );
    } else {
      descriptions.push(
        client.ch.stp(lan.descriptionRolesNoAudit, {
          user: member.user,
        }),
      );
    }
  };

  const nickUpdate = async () => {
    if (!('nick' in oldMember)) return;
    changedKeys.push('nick');

    const oldNick = oldMember.nick || language.none;
    const newNick = member.nick || language.none;

    embed.fields?.push(
      {
        name: lan.oldNick,
        value: oldNick,
        inline: false,
      },
      {
        name: lan.newNick,
        value: newNick,
        inline: false,
      },
    );

    const audit = await getAudit(guild, member, 24);

    if (audit && audit.user.id === member.user.id) {
      descriptions.push(client.ch.stp(lan.descriptionNickSelf, { user: member.user }));
    } else if (audit) {
      descriptions.push(
        client.ch.stp(lan.descriptionNick, { user: audit.user, target: member.user }),
      );
    } else {
      descriptions.push(client.ch.stp(lan.descriptionNickNoAudit, { user: member.user }));
    }
  };

  const files: Eris.FileContent[] = [];

  const avatarUpdate = async () => {
    if (!('avatar' in oldMember)) return;
    changedKeys.push('avatar');

    const newAvatar = member.avatar
      ? client.ch.stp(client.constants.standard.guildAvatarURL, {
          member,
          guild,
          fileEnd: member.avatar.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [newAvatarFile] = await client.ch.fileURL2Buffer([newAvatar]);

    if (newAvatarFile) {
      newAvatarFile.name = `${member.avatar}.${member.avatar?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://${member.avatar}.${member.avatar?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newAvatarFile);
    }

    if (newAvatar) {
      embed.fields?.push({
        name: lan.avatar,
        value: lan.avatarAppear,
        inline: false,
      });
    }

    descriptions.push(client.ch.stp(lan.descriptionAvatar, { user: member.user }));
  };

  const timeoutUpdate = async () => {
    if (!('communicationDisabledUntil' in oldMember)) return;
    changedKeys.push('communicationDisabledUntil');

    const audit = await getAudit(guild, member, 24);

    if (audit) {
      if (oldMember.communicationDisabledUntil && !member.communicationDisabledUntil) {
        descriptions.push(
          client.ch.stp(lan.descriptionTimeoutRemove, { user: audit.user, target: member.user }),
        );
      } else {
        descriptions.push(
          client.ch.stp(lan.descriptionTimeout, {
            user: audit.user,
            target: member.user,
            time: String(member.communicationDisabledUntil).slice(0, -3),
            fullTime: moment
              .duration(Date.now() - Number(member.communicationDisabledUntil))
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              ),
          }),
        );
      }
    } else if (oldMember.communicationDisabledUntil && !member.communicationDisabledUntil) {
      descriptions.push(
        client.ch.stp(lan.descriptionTimeoutRemoveNoAudit, { target: member.user }),
      );
    } else {
      descriptions.push(
        client.ch.stp(lan.descriptionTimeoutNoAudit, {
          target: member.user,
          time: String(member.communicationDisabledUntil).slice(0, -3),
          fullTime: moment
            .duration(Date.now() - Number(member.communicationDisabledUntil))
            .format(
              `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
              { trim: 'all' },
            ),
        }),
      );
    }
  };

  const boostUpdate = () => {
    if (!('premiumSince' in oldMember)) return;
    changedKeys.push('premiumSince');

    if (oldMember.premiumSince && !member.premiumSince) {
      descriptions.push(client.ch.stp(lan.descriptionBoostingEnd, { user: member.user }));
    } else {
      descriptions.push(client.ch.stp(lan.descriptionBoostingStart, { user: member.user }));
    }
  };

  const pendingUpdate = () => {
    changedKeys.push('pending');

    descriptions.push(client.ch.stp(lan.descriptionVerify, { user: member.user }));
  };

  switch (true) {
    case 'roles' in oldMember &&
      oldMember.roles
        .sort((a, b) => Number(guild.roles.get(a)?.position) - Number(guild.roles.get(b)?.position))
        .join(' ') !==
        member.roles
          .sort(
            (a, b) => Number(guild.roles.get(a)?.position) - Number(guild.roles.get(b)?.position),
          )
          .join(' '): {
      await roleUpdate();
      break;
    }
    case 'nick' in oldMember && oldMember.nick !== member.nick: {
      await nickUpdate();
      break;
    }
    case 'avatar' in oldMember && oldMember.avatar !== member.avatar: {
      await avatarUpdate();
      break;
    }
    case 'communicationDisabledUntil' in oldMember &&
      oldMember.communicationDisabledUntil !== member.communicationDisabledUntil: {
      await timeoutUpdate();
      break;
    }
    case 'premiumSince' in oldMember && oldMember.premiumSince !== member.premiumSince: {
      boostUpdate();
      break;
    }
    case 'pending' in oldMember && oldMember.pending !== member.pending: {
      pendingUpdate();
      break;
    }
    default: {
      break;
    }
  }

  embed.description = descriptions.join('\n\n');

  if (!changedKeys.length) return;

  client.ch.send(channels, { files, embeds: [embed] }, language, null, 10000);
};

const getAudit = async (guild: Eris.Guild, member: Eris.Member, actionType: number) => {
  if (!guild?.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 5, actionType });
  if (!audits || !audits.entries) return null;

  return audits.entries
    .filter((a) => a.targetID === member.user.id)
    .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};
