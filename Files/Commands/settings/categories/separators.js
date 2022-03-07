const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      const sep = msg.guild.roles.cache.get(r.separator);
      const stop = r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : null;

      let affected;
      let affectedText;
      let sepMention;
      if (sep) {
        affectedText =
          msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep.position
            ? `\n${msg.client.textEmotes.warning} ${msg.language.permissions.error.role}`
            : '';

        sepMention = `${sep}`;

        affected = r.stoprole
          ? (sep?.position > stop?.position
              ? (sep?.position || 0) - (stop?.position || 0)
              : (stop?.position || 0) - (sep?.position || 0)) - 1
          : (sep?.position >= msg.guild.roles.highest.position
              ? (sep?.position || 0) - msg.guild.roles.highest.position
              : msg.guild.roles.highest.position - (sep?.position || 0)) - 1;
      } else {
        sepMention = `${msg.client.textEmotes.warning} ${msg.lan.deletedRole}`;

        affected = `--`;
      }

      let stopMention;
      if (stop) {
        stopMention = `${stop}`;
      } else {
        stopMention = `${msg.client.textEmotes.warning} ${msg.lan.deletedRole}`;
      }

      if (Number.isNaN(+affected)) affected = '--';

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.separator}: ${sepMention}\n${msg.lan.stoprole}: ${
          r.stoprole ? stopMention : msg.language.none
        }\n${msg.language.affected}: ${affected} ${msg.language.roles}${affectedText || ''}`,
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
      if (sep?.position > stop?.position) {
        affected = (sep?.position || 0) - (stop?.position || 0);
      } else {
        affected = (stop?.position || 0) - (sep?.position || 0) - 1;
      }
    } else {
      affected = msg.guild.roles.highest.position - (sep?.position || 0) - 1;
    }

    const affectedRoles = [];
    if (r.stoprole) {
      if (sep?.position > stop?.position) {
        for (
          let i = (stop?.position || 0) + 1;
          i < msg.guild.roles.highest.position && i < sep?.position;
          i += 1
        ) {
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));
        }
      } else {
        for (
          let i = (sep?.position || 0) + 1;
          i < msg.guild.roles.highest.position && i < stop?.position;
          i += 1
        ) {
          affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));
        }
      }
    } else if (sep?.position < msg.guild.roles.highest.position) {
      for (
        let i = (sep?.position || 0) + 1;
        i < msg.guild.roles.highest.position && i < msg.guild.roles.highest.position;
        i += 1
      ) {
        affectedRoles.push(msg.guild.roles.cache.find((role) => role.position === i));
      }
    }

    const embed = new Discord.UnsafeEmbed();

    if (r.isvarying === true) {
      let affectedRoleText;
      if (`${affectedRoles.map((role) => ` ${role}`)} `.length > 1020) {
        affectedRoleText = msg.language.tooManyRoles;
      } else if (`${affectedRoles.map((role) => ` ${role}`)} `.length) {
        affectedRoleText = affectedRoles.map((role) => ` ${role} `);
      } else {
        affectedRoleText = msg.language.none;
      }

      let sepMention;
      if (sep) {
        sepMention = `${sep}`;
      } else {
        sepMention = `${msg.client.textEmotes.warning} ${msg.lan.deletedRole}`;
      }

      let stopMention;
      if (stop) {
        stopMention = `${stop}`;
      } else {
        stopMention = `${msg.client.textEmotes.warning} ${msg.lan.deletedRole}`;
      }

      let affectedNumber;
      if (Number.isNaN(+affected)) {
        affectedNumber = '--';
      } else {
        affectedNumber = affected;
      }

      embed.addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name:
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep?.position
              ? `${msg.client.textEmotes.warning} ${msg.language.permissions.error.role}`
              : '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.isvarying,
          value: r.isvarying
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.separator,
          value: r.separator ? `${sepMention}` : msg.language.none,
          inline: false,
        },
        {
          name: msg.lan.stoprole,
          value: r.stoprole ? `${stopMention}` : msg.language.none,
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
          name: `${msg.language.affected} ${affectedNumber} ${msg.language.roles}`,
          value: `${affectedRoleText}\u200b`,
          inline: false,
        },
      );
    } else {
      embed.addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name:
            msg.guild.members.cache.get(msg.client.user.id).roles.highest.position <= sep?.position
              ? `${msg.client.textEmotes.warning} ${msg.language.permissions.error.role}`
              : '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.isvarying,
          value: r.isvarying
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
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
      const active = new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.active.name)
        .setLabel(msg.lanSettings.active)
        .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
      const separator = new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.separator.name)
        .setLabel(msg.lan.separator)
        .setStyle(Discord.ButtonStyle.Secondary);
      const stoprole = new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.stoprole.name)
        .setLabel(msg.lan.stoprole)
        .setStyle(Discord.ButtonStyle.Secondary);
      const isvarying = new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.isvarying.name)
        .setLabel(msg.lan.isvarying)
        .setStyle(r.isvarying ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
      const oneTimeRunner = new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.oneTimeRunner.name)
        .setLabel(msg.lan.oneTimeRunner)
        .setEmoji(msg.client.objectEmotes.warning)
        .setStyle(Discord.ButtonStyle.Danger);
      return [[active], [separator, stoprole], [isvarying], [oneTimeRunner]];
    }
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const separator = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.separator.name)
      .setLabel(msg.lan.separator)
      .setStyle(Discord.ButtonStyle.Secondary);
    const isvarying = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.isvarying.name)
      .setLabel(msg.lan.isvarying)
      .setStyle(r.isvarying ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
    const roles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);
    const oneTimeRunner = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.oneTimeRunner.name)
      .setLabel(msg.lan.oneTimeRunner)
      .setEmoji(msg.client.objectEmotes.warning)
      .setStyle(Discord.ButtonStyle.Danger);
    return [[active], [separator, roles], [isvarying], [oneTimeRunner]];
  },
};
