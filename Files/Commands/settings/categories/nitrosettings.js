const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  childOf: 'nitro',
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.bpchannelid,
        value: `${
          r.bpchannelid && r.bpchannelid.length
            ? r.bpchannelid.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.bpuserid,
        value: `${
          r.bpuserid && r.bpuserid.length ? r.bpuserid.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.bproleid,
        value: `${
          r.bproleid && r.bproleid.length ? r.bproleid.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.language.punishments,
        value:
          `${msg.lan.readofwarnstof}\n${
            r.readofwarnstof
              ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
              : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
          }\n\n` +
          `${msg.client.ch.stp(msg.lan.muteafterwarnsamount, {
            amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.kickafterwarnsamount, {
            amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.banafterwarnsamount, {
            amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--',
          })}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.giveofficialwarnstof,
        value: r.giveofficialwarnstof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.muteenabledtof,
        value: r.muteenabledtof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.kickenabledtof,
        value: r.kickenabledtof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.banenabledtof,
        value: r.banenabledtof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
    );
    return embed;
  },
  buttons(msg, r) {

    return [];
  },
};
