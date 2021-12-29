const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  async mmrEmbed(msg, res) {
    const embed = new Discord.MessageEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      const sep = msg.guild.roles.cache.get(r.separator);
      const stop = r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : null;
      const affected = r.stoprole
        ? (sep.position > stop.position
            ? sep.position - stop.position
            : stop.position - sep.position) - 1
        : (sep.position >= msg.guild.roles.highest.position
            ? sep.position - msg.guild.roles.highest.position
            : msg.guild.roles.highest.position - sep.position) - 1;
      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.separator}: ${sep}\n${msg.lan.stoprole}: ${
          r.stoprole ? stop : msg.language.none
        }\n${msg.language.affected}: ${affected} ${msg.language.roles}${
          msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep.position
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
      if (sep.position > stop.position) {
        affected = sep.position - stop.position;
      } else {
        affected = stop.position - sep.position - 1;
      }
    } else {
      affected = msg.guild.roles.highest.position - sep.position - 1;
    }

    const affectedRoles = [];
    if (r.stoprole) {
      if (sep.position > stop.position)
        for (
          let i = stop.position + 1;
          i < msg.guild.roles.highest.position && i < sep.position;
          i += 1
        )
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));
      else
        for (
          let i = sep.position + 1;
          i < msg.guild.roles.highest.position && i < stop.position;
          i += 1
        )
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));
    } else if (sep.position < msg.guild.roles.highest.position)
      for (
        let i = sep.position + 1;
        i < msg.guild.roles.highest.position && i < msg.guild.roles.highest.position;
        i += 1
      )
        affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));

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
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep.position
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
          value: !Number.isNaN(+r.id) ? `\`${r.id}\`` : msg.language.none,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: `${msg.language.affected} ${affected} ${msg.language.roles}`,
          value: `${affectedRoleText}\u200b`,
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
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep.position
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
          value: r.separator ? `${msg.guild.roles.cache.get(r.separator)}` : msg.language.none,
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
          value: !Number.isNaN(+r.id) ? `\`${r.id}\`` : msg.language.none,
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
      .setStyle('SECONDARY');
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
