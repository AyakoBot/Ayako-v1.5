import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';

export default async () => {
  const rawUsers = (
    await client.ch
      .query(`SELECT * FROM nitrousers;`)
      .then((r: DBT.nitrousers[] | null) => r || null)
  )?.filter((u) => client.guilds.get(u.guildid));
  if (!rawUsers) return;

  const usersWithDays = rawUsers
    .slice()
    .filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.userid === value.userid && t.guildid === value.guildid),
    );

  usersWithDays.forEach((user) => {
    const entries = rawUsers.filter((u) => u.userid === user.userid && u.guildid === user.guildid);
    const days = entries.map((e) =>
      getDays(Number(e.booststart), e.boostend ? Number(e.boostend) : Date.now()),
    );

    const totalDays = days.reduce((a, b) => a + b, 0);
    user.days = totalDays;
  });

  usersWithDays.forEach(async (rawUser) => {
    const guild = client.guilds.get(rawUser.guildid);
    if (!guild) return;

    const settings = await client.ch
      .query(`SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`, [guild.id])
      .then((r: DBT.nitrosettings[] | null) => (r ? r[0] : null));
    if (!settings) return;

    const roleSettings = await client.ch
      .query(`SELECT * FROM nitroroles WHERE guildid = $1;`, [guild.id])
      .then((r: DBT.nitroroles[] | null) => r || null);
    if (!roleSettings) return;

    const rolesUserQualifiesFor = roleSettings.filter(
      (role) => Number(role.days) <= Number(rawUser.days),
    );
    if (!rolesUserQualifiesFor) return;

    const member = await client.ch.getMember(rawUser.userid, guild.id);
    if (!member) return;

    const [rolesToAdd, rolesToRemove] = getRolesToAssign(
      rolesUserQualifiesFor,
      settings.rolemode,
      member,
      guild,
      roleSettings,
      rawUser.days,
    );

    const language = await client.ch.languageSelector(guild.id);

    if (rolesToAdd.length) client.ch.roleManager.add(member, rolesToAdd, language.autotypes.nitro);
    if (rolesToRemove.length) {
      client.ch.roleManager.remove(member, rolesToRemove, language.autotypes.nitro);
    }

    log(rolesToAdd, rolesToRemove, guild, settings, member.user, rawUser.days);
  });
};

const getDays = (start: number, end: number) => {
  const timeDiff = Math.abs(start - end);
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};

const getRolesToAssign = (
  roles: DBT.nitroroles[],
  replacing: boolean,
  member: Eris.Member,
  guild: Eris.Guild,
  roleSettings: DBT.nitroroles[],
  days?: number,
) => {
  const allRoles: string[] = [];
  roleSettings.forEach((r) => {
    if (r.roles?.length) allRoles.push(...r.roles);
  });

  const rolesToAdd: string[] = [];
  const rolesToRemove: string[] = [];

  if (replacing) {
    const rolesToUse = roles
      .filter((r) => Number(r.days) <= Number(days))
      .sort((b, a) => Number(a.days) - Number(b.days))[0];
    if (!rolesToUse) return [[], []];

    rolesToUse.roles
      ?.filter((r) => guild.roles.get(r) && !member.roles.includes(r))
      .forEach((r) => rolesToAdd.push(r));

    allRoles
      .filter((r) => member.roles.includes(r) && !rolesToAdd.includes(r))
      .forEach((r) => rolesToRemove.push(r));
  } else {
    const rolesToUse = roles.filter((r) => Number(r.days) <= Number(days));
    if (!rolesToUse) return [[], []];

    rolesToUse.forEach((r) =>
      r.roles
        ?.filter((role) => guild.roles.get(role) && !member.roles.includes(role))
        .forEach((role) => rolesToAdd.push(role)),
    );
  }

  return [rolesToAdd, rolesToRemove];
};

const log = async (
  rolesToAdd: string[],
  rolesToRemove: string[],
  guild: Eris.Guild,
  settings: DBT.nitrosettings,
  user: Eris.User,
  days?: number,
) => {
  if (settings.logchannels?.length) {
    const language = await client.ch.languageSelector(guild.id);
    const lan = language.nitro;

    const embeds: Eris.Embed[] = [];

    if (rolesToAdd.length) {
      embeds.push({
        type: 'rich',
        description: client.ch.stp(lan.given, {
          user,
          roles: rolesToAdd.map((r) => `<@&${r}>`).join(', '),
          days,
        }),
        color: client.constants.colors.success,
      });
    }

    if (rolesToRemove.length) {
      embeds.push({
        type: 'rich',
        description: client.ch.stp(lan.taken, {
          user,
          roles: rolesToRemove.map((r) => `<@&${r}>`).join(', '),
        }),
        color: client.constants.colors.warning,
      });
    }

    const channels = settings.logchannels.map((c) => guild.channels.get(c));
    if (!channels?.length || !embeds.length) return;
    client.ch.send(channels, { embeds }, language, null, 10000);
  }
};
