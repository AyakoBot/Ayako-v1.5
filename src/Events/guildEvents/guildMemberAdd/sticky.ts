import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/en.json'),
) => {
  stickyroles(member, guild, language);
  stickyperms(member, guild, language);
};

const stickyroles = async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/en.json'),
) => {
  const stickyrolemembersRow = await client.ch
    .query(`SELECT * FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`, [
      member.user.id,
      guild.id,
    ])
    .then((r: DBT.stickyrolemembers[] | null) => (r ? r[0] : null));
  if (!stickyrolemembersRow) return;

  const stickyRow = await client.ch
    .query(`SELECT * FROM sticky WHERE guildid = $1 AND stickyrolesactive = true;`, [guild.id])
    .then((r: DBT.sticky[] | null) => (r ? r[0] : null));
  if (!stickyRow) return;
  if (!stickyRow.roles) return;

  const rolesToAdd = getRoles(
    stickyRow.stickyrolesmode,
    stickyRow.roles,
    stickyrolemembersRow.roles,
    guild,
  );

  await client.ch.query(`DELETE FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`, [
    member.user.id,
    guild.id,
  ]);

  if (rolesToAdd.length) {
    await client.ch.roleManager.add(
      member,
      rolesToAdd,
      language.slashCommands.settings.settings.sticky.roleReason,
    );
  }
};

const getRoles = (mode: boolean, roles: string[], memberRoles: string[], guild: Eris.Guild) => {
  if (mode) {
    return memberRoles
      .filter((id) => !roles?.includes(id))
      .filter((id) => !!guild.roles.get(id))
      .filter(
        (id) =>
          Number(guild.roles.get(id)?.position) <
          Math.max(
            ...(guild.members
              .get(client.user.id)
              ?.roles.map((r) => Number(guild.roles.get(r)?.position)) || []),
          ),
      );
  }
  return memberRoles
    .filter((id) => roles?.includes(id))
    .filter((id) => !!guild.roles.get(id))
    .filter(
      (id) =>
        Number(guild.roles.get(id)?.position) <
        Math.max(
          ...(guild.members
            .get(client.user.id)
            ?.roles.map((r) => Number(guild.roles.get(r)?.position)) || []),
        ),
    );
};

const stickyperms = async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/en.json'),
) => {
  const stickypermmembersRows = await client.ch
    .query(`SELECT * FROM stickypermmembers WHERE userid = $1 AND guildid = $2;`, [
      member.user.id,
      guild.id,
    ])
    .then((r: DBT.stickypermmembers[] | null) => r || null);
  if (!stickypermmembersRows) return;

  await client.ch
    .query(`DELETE FROM stickypermmembers WHERE userid = $1 AND guildid = $2;`, [
      member.user.id,
      guild.id,
    ])
    .then((r: DBT.sticky[] | null) => (r ? r[0] : null));

  const settingsRes = await client.ch.query(
    `SELECT * FROM sticky WHERE guildid = $1 AND stickypermsactive = true;`,
    [guild.id],
  );

  if (!settingsRes) return;

  await addPerms(stickypermmembersRows, guild, language);
};

const addPerms = async (
  stickypermmembersRows: DBT.stickypermmembers[],
  guild: Eris.Guild,
  language: typeof import('../../../Languages/en.json'),
) =>
  stickypermmembersRows.forEach((stickypermmembersRow) => {
    const channel = guild.channels.get(stickypermmembersRow.channelid);
    if (!channel) return;

    channel.editPermission(
      stickypermmembersRow.userid,
      stickypermmembersRow.allowbits || 0,
      stickypermmembersRow.denybits || 0,
      1,
      language.slashCommands.settings.settings.sticky.permReason,
    );
  });
