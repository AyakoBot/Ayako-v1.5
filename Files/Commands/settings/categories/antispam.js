const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  type: 1,
  finished: true,
  category: ['auto-moderation'],
  helpCategory: 'mod',
  displayEmbed(msg, r) {
    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
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
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
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
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.muteenabledtof,
        value: r.muteenabledtof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.kickenabledtof,
        value: r.kickenabledtof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.banenabledtof,
        value: r.banenabledtof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const rw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.readofwarnstof.name)
      .setLabel(msg.lan.readofwarnstof.replace(/\*/g, '').slice(0, 14))
      .setStyle(r.readofwarnstof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const wm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.giveofficialwarnstof.name)
      .setLabel(msg.lan.giveofficialwarnstof)
      .setStyle(r.giveofficialwarnstof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.muteenabledtof.name)
      .setLabel(msg.lan.muteenabledtof)
      .setStyle(r.muteenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const km = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kickenabledtof.name)
      .setLabel(msg.lan.kickenabledtof)
      .setStyle(r.kickenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const bm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.banenabledtof.name)
      .setLabel(msg.lan.banenabledtof)
      .setStyle(r.banenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channel = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bpchannelid.name)
      .setLabel(msg.lan.bpchannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const role = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const maw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.muteafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.muteafterwarnsamount.replace(/\*/g, ''), {
          amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Secondary);
    const kaw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kickafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.kickafterwarnsamount.replace(/\*/g, ''), {
          amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Secondary);
    const baw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.banafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.banafterwarnsamount.replace(/\*/g, ''), {
          amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Secondary);
    return [[active], [channel, user, role], [rw, maw, kaw, baw], [wm, mm, km, bm]];
  },
};
