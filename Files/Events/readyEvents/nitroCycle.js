const Builders = require('@discordjs/builders');
const client = require('../../BaseClient/DiscordClient');

module.exports = async () => {
  const rawUsers = await getUsers();
  if (!rawUsers) return;

  let usersWithDays = rawUsers.slice();
  usersWithDays = usersWithDays.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.userid === value.userid && t.guildid === value.guildid),
  );

  usersWithDays.forEach((user) => {
    const entries = rawUsers.filter((u) => u.userid === user.userid && u.guildid === user.guildid);
    const days = entries.map((e) => getDays(e.booststart, e.boostend ? e.boostend : Date.now()));

    const totalDays = days.reduce((a, b) => a + b, 0);
    user.days = totalDays;
  });

  usersWithDays.forEach(async (rawUser) => {
    const guild = client.guilds.cache.get(rawUser.guildid);
    if (!guild) return;

    const settings = await getSettings(guild);
    if (!settings) return;

    const roleSettings = await getRoleSettings(guild);
    if (!roleSettings) return;

    const user = await client.users.fetch(rawUser.userid).catch(() => {});
    if (!user) return;

    const rolesUserQualifiesFor = roleSettings.filter((role) => role.days <= rawUser.days);
    if (!rolesUserQualifiesFor) return;

    const member = await guild.members.fetch(user.id).catch(() => {});
    if (!member) return;

    const [rolesToAdd, rolesToRemove] = getRolesToAssign(
      rolesUserQualifiesFor,
      settings.rolemode,
      member,
      guild,
      roleSettings,
      rawUser.days,
    );

    if (rolesToAdd.length) member.roles.add(rolesToAdd);
    if (rolesToRemove.length) member.roles.remove(rolesToRemove);

    log(rolesToAdd, rolesToRemove, guild, settings, user, rawUser.days);
  });
};

const getUsers = async () => {
  const res = await client.ch.query(`SELECT * FROM nitrousers;`);
  if (res && res.rowCount) return res.rows;
  return null;
};

const getRoleSettings = async (guild) => {
  const res = await client.ch.query(`SELECT * FROM nitroroles WHERE guildid = $1;`, [guild.id]);
  if (res && res.rowCount) return res.rows;
  return null;
};

const getSettings = async (guild) => {
  const res = await client.ch.query(
    `SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`,
    [guild.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getDays = (start, end) => {
  const timeDiff = Math.abs(start - end);
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};

const getRolesToAssign = (roles, replacing, member, guild, roleSettings, days) => {
  const allRoles = [];
  roleSettings.forEach((r) => {
    if (r.roles?.length) allRoles.push(...r.roles);
  });

  const rolesToAdd = [];
  const rolesToRemove = [];

  if (replacing) {
    const rolesToUse = roles.filter((r) => r.days <= days).sort((b, a) => a.days - b.days)[0];
    if (!rolesToUse) return [[], []];

    rolesToUse.roles?.forEach((role) => {
      if (guild.roles.cache.get(role)) {
        if (!member.roles.cache.has(role)) rolesToAdd.push(role);
      }
    });

    allRoles.forEach((r) => {
      if (member.roles.cache.has(r) && !rolesToAdd.includes(r)) rolesToRemove.push(r);
    });
  } else {
    const rolesToUse = roles.filter((r) => r.days <= days);
    if (!rolesToUse) return [[], []];

    rolesToUse.forEach((r) =>
      r.roles?.forEach((role) => {
        if (guild.roles.cache.get(role)) {
          if (!member.roles.cache.has(role)) rolesToAdd.push(role);
        }
      }),
    );
  }

  return [rolesToAdd, rolesToRemove];
};

const log = async (rolesToAdd, rolesToRemove, guild, settings, user, days) => {
  if (settings.logchannels?.length) {
    const language = await client.ch.languageSelector(guild);
    const lan = language.nitro;

    const embeds = [];

    if (rolesToAdd.length) {
      const addEmbed = new Builders.UnsafeEmbedBuilder()
        .setDescription(
          guild.client.ch.stp(lan.given, {
            user,
            roles: rolesToAdd.map((r) => `<@&${r}>`).join(', '),
            days,
          }),
        )
        .setColor(guild.client.constants.colors.success);

      embeds.push(addEmbed);
    }

    if (rolesToRemove.length) {
      const removeEmbed = new Builders.UnsafeEmbedBuilder()
        .setDescription(
          guild.client.ch.stp(lan.taken, {
            user,
            roles: rolesToRemove.map((r) => `<@&${r}>`).join(', '),
          }),
        )
        .setColor(guild.client.constants.colors.warning);

      embeds.push(removeEmbed);
    }

    const logChannels = settings.logchannels.map((c) => guild.channels.cache.get(c));
    if (logChannels?.length && embeds.length) {
      guild.client.ch.send(logChannels, { embeds }, 5000);
    }
  }
};
