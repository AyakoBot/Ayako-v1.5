const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  async mmrEmbed(msg, res) {
    const result = await checker(msg, res);
    if (result)
      res = (
        await msg.client.ch.query(
          'SELECT * FROM roleseparator WHERE guildid = $1 ORDER BY uniquetimestamp DESC;',
          [msg.guild.id],
        )
      ).rows;

    const embed = new Discord.MessageEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      const sep = msg.guild.roles.cache.get(r.separator);
      const stop = r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : null;
      const affected = r.stoprole
        ? (sep.rawPosition > stop.rawPosition
            ? sep.rawPosition - stop.rawPosition
            : stop.rawPosition - sep.rawPosition) - 1
        : (sep.rawPosition >= msg.guild.roles.highest.rawPosition
            ? sep.rawPosition - msg.guild.roles.highest.rawPosition
            : msg.guild.roles.highest.rawPosition - sep.rawPosition) - 1;
      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.separator}: ${sep}\n${msg.lan.stoprole}: ${
          r.stoprole ? stop : msg.language.none
        }\n${msg.language.affected}: ${affected} ${msg.language.roles}${
          msg.guild.members.cache.get(msg.client.user.id).roles.highest.rawPosition <=
          sep.rawPosition
            ? `\n${msg.client.constants.emotes.warning} ${msg.language.permissions.error.role}`
            : ''
        }`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const sep = msg.guild.roles.cache.get(r.separator);
    const stop = r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : null;

    let affected;
    if (r.stoprole) {
      if (sep.rawPosition > stop.rawPosition) {
        affected = sep.rawPosition - stop.rawPosition;
      } else {
        affected = stop.rawPosition - sep.rawPosition - 1;
      }
    } else if (sep.rawPosition >= msg.guild.roles.highest.rawPosition) {
      affected = msg.guild.roles.highest.rawPosition - sep.rawPosition - 1;
    }

    const affectedRoles = [];
    if (r.stoprole) {
      if (sep.rawPosition > stop.rawPosition)
        for (
          let i = stop.rawPosition + 1;
          i < msg.guild.roles.highest.rawPosition && i < sep.rawPosition;
          i += 1
        )
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.rawPosition === i));
      else
        for (
          let i = sep.rawPosition + 1;
          i < msg.guild.roles.highest.rawPosition && i < stop.rawPosition;
          i += 1
        )
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.rawPosition === i));
    } else if (sep.rawPosition < msg.guild.roles.highest.rawPosition)
      for (
        let i = sep.rawPosition + 1;
        i < msg.guild.roles.highest.rawPosition && i < msg.guild.roles.highest.rawPosition;
        i += 1
      )
        affectedRoles.push(msg.guild.roles.cache.find((role) => role.rawPosition === i));
    const embed = new Discord.MessageEmbed();
    if (r.isvarying === true) {
      let affectedRoleText;
      if (`${affectedRoles.map((role) => ` ${role}`)} `.length > 1020) {
        affectedRoleText = msg.language.tooManyRoles;
      } else if (`${affectedRoles.map((role) => ` ${role}`)} `.length) {
        affectedRoleText = affectedRoles.map((role) => ` ${role} `);
      } else {
        affectedRoleText = msg.language.none;
      }

      embed.addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name:
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.rawPosition <=
            sep.rawPosition
              ? `${msg.client.constants.emotes.warning} ${msg.language.permissions.error.role}`
              : '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.isvarying,
          value: r.isvarying
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.separator,
          value: r.separator ? `${sep}` : msg.language.none,
          inline: false,
        },
        {
          name: msg.lan.stoprole,
          value: r.stoprole ? `${stop}` : msg.language.none,
          inline: false,
        },
        {
          name: msg.language.number,
          value: r.id ? `\`${r.id}\`` : msg.language.none,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: `${msg.language.affected} ${affected} ${msg.language.roles}`,
          value: affectedRoleText,
          inline: false,
        },
      );
    } else {
      embed.addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name:
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.rawPosition <=
            sep.rawPosition
              ? `${msg.client.constants.emotes.warning} ${msg.language.permissions.error.role}`
              : '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.language.isvarying,
          value: r.isvarying
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.separator,
          value: r.separator ? `\`${msg.guild.roles.cache.get(r.separator)}\`` : msg.language.none,
          inline: false,
        },
        {
          name: msg.lan.roles,
          value: `${
            r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
          }`,
          inline: false,
        },
        {
          name: msg.language.number,
          value: r.id ? `\`${r.id}\`` : msg.language.none,
          inline: false,
        },
      );
    }
    return embed;
  },
  buttons(msg, r) {
    if (r.isvarying === true) {
      const active = new Discord.MessageButton()
        .setCustomId(msg.lan.edit.active.name)
        .setLabel(msg.lanSettings.active)
        .setStyle(r.active ? 'SUCCESS' : 'DANGER');
      const separator = new Discord.MessageButton()
        .setCustomId(msg.lan.edit.separator.name)
        .setLabel(msg.lan.separator)
        .setStyle('SECONDARY');
      const stoprole = new Discord.MessageButton()
        .setCustomId(msg.lan.edit.stoprole.name)
        .setLabel(msg.lan.stoprole)
        .setStyle('SECONDARY');
      const isvarying = new Discord.MessageButton()
        .setCustomId(msg.lan.edit.isvarying.name)
        .setLabel(msg.lan.isvarying)
        .setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
      const oneTimeRunner = new Discord.MessageButton()
        .setCustomId(msg.lan.edit.oneTimeRunner.name)
        .setLabel(msg.lan.oneTimeRunner)
        .setEmoji(msg.client.constants.emotes.warning)
        .setStyle('DANGER');
      return [[active], [separator, stoprole], [isvarying], [oneTimeRunner]];
    }
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');
    const separator = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.separator.name)
      .setLabel(msg.lan.separator)
      .isvarying('SECONDARY');
    const isvarying = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.isvarying.name)
      .setLabel(msg.lan.isvarying)
      .setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
    const roles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle('PRIMARY');
    const oneTimeRunner = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.oneTimeRunner.name)
      .setLabel(msg.lan.oneTimeRunner)
      .setEmoji(msg.client.constants.emotes.warning)
      .setStyle('DANGER');
    return [[active], [separator, roles], [isvarying], [oneTimeRunner]];
  },
};

async function checker(msg, res) {
  const sepend = [];
  const stopend = [];

  res.forEach((r) => {
    const sep = msg.guild.roles.cache.get(r.separator);
    const stop = msg.guild.roles.cache.get(r.stoprole);
    if (!sep || !sep.id) sepend.push(r.separator);
    if (!stop || !stop.id) stopend.push(r.stoprole);
  });

  const promises = [];

  sepend.forEach((s) => {
    promises.push(
      msg.client.ch.query('DELETE FROM roleseparator WHERE guildid = $1 AND separator = $2;', [
        msg.guild.id,
        s,
      ]),
    );
  });

  stopend.forEach((s) => {
    promises.push(
      msg.client.ch.query('DELETE FROM roleseparator WHERE guildid = $1 AND stoprole = $2;', [
        msg.guild.id,
        s,
      ]),
    );
  });

  await Promise.all(promises);

  if (sepend.length || stopend.length) return true;
  return false;
}
