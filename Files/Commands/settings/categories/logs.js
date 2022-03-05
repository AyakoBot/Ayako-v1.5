const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields([
      {
        name: '\u200b',
        value: `**${msg.lan.discordLogs}**`,
        inline: false,
      },
      {
        name: msg.lan.emojievents,
        value: `${
          r.emojievents && r.emojievents.length
            ? r.emojievents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.guildevents,
        value: `${
          r.guildevents && r.guildevents.length
            ? r.guildevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.inviteevents,
        value: `${
          r.inviteevents && r.inviteevents.length
            ? r.inviteevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.messageevents,
        value: `${
          r.messageevents && r.messageevents.length
            ? r.messageevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.roleevents,
        value: `${
          r.roleevents && r.roleevents.length
            ? r.roleevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.userevents,
        value: `${
          r.userevents && r.userevents.length
            ? r.userevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.voiceevents,
        value: `${
          r.voiceevents && r.voiceevents.length
            ? r.voiceevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.webhookevents,
        value: `${
          r.webhookevents && r.webhookevents.length
            ? r.webhookevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.channelevents,
        value: `${
          r.channelevents && r.channelevents.length
            ? r.channelevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.stageinstanceevents,
        value: `${
          r.stageinstanceevents && r.stageinstanceevents.length
            ? r.stageinstanceevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.stickerevents,
        value: `${
          r.stickerevents && r.stickerevents.length
            ? r.stickerevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.threadevents,
        value: `${
          r.threadevents && r.threadevents.length
            ? r.threadevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.guildmemberevents,
        value: `${
          r.guildmemberevents && r.guildmemberevents.length
            ? r.guildmemberevents.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
      {
        name: '\u200b',
        value: `**${msg.lan.ayakoLogs}**`,
        inline: false,
      },
      {
        name: msg.lan.modlogs,
        value: `${
          r.modlogs && r.modlogs.length ? r.modlogs.map((id) => ` <#${id}>`) : msg.language.none
        }`,
        inline: true,
      },
      {
        name: msg.lan.settingslog,
        value: `${
          r.settingslog && r.settingslog.length
            ? r.settingslog.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: true,
      },
    ]);
    return embed;
  },
  buttons(msg) {
    const guildevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.guildevents.name)
      .setLabel(msg.lan.guildevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const emojievents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.emojievents.name)
      .setLabel(msg.lan.emojievents)
      .setStyle(Discord.ButtonStyle.Primary);
    const inviteevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.inviteevents.name)
      .setLabel(msg.lan.inviteevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const messageevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.messageevents.name)
      .setLabel(msg.lan.messageevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const roleevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.roleevents.name)
      .setLabel(msg.lan.roleevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const userevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.userevents.name)
      .setLabel(msg.lan.userevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const voiceevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.voiceevents.name)
      .setLabel(msg.lan.voiceevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const webhookevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.webhookevents.name)
      .setLabel(msg.lan.webhookevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const channelevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.channelevents.name)
      .setLabel(msg.lan.channelevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const stageinstanceevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.stageinstanceevents.name)
      .setLabel(msg.lan.stageinstanceevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const stickerevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.stickerevents.name)
      .setLabel(msg.lan.stickerevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const threadevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.threadevents.name)
      .setLabel(msg.lan.threadevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const guildmemberevents = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.guildmemberevents.name)
      .setLabel(msg.lan.guildmemberevents)
      .setStyle(Discord.ButtonStyle.Primary);
    const modlogs = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.modlogs.name)
      .setLabel(msg.lan.modlogs)
      .setStyle(Discord.ButtonStyle.Primary);
    const settingslog = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.settingslog.name)
      .setLabel(msg.lan.settingslog)
      .setStyle(Discord.ButtonStyle.Primary);

    return [
      [guildevents, emojievents, inviteevents, messageevents, roleevents],
      [userevents, voiceevents, webhookevents, channelevents],
      [stageinstanceevents, stickerevents, threadevents, guildmemberevents],
      [modlogs, settingslog],
    ];
  },
};
