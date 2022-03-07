const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 1,
  finished: false,
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.channel,
        value: `${r.channel && r.channel.length ? ` <#${r.channel}>` : msg.language.none}`,
        inline: false,
      },
      {
        name: msg.lan.stat,
        value: r.giveofficialwarnstof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const rw = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.readofwarnstof.name)
      .setLabel(msg.lan.readofwarnstof.replace(/\*/g, '').slice(0, 14))
      .setStyle(r.readofwarnstof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const wm = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.giveofficialwarnstof.name)
      .setLabel(msg.lan.giveofficialwarnstof)
      .setStyle(r.giveofficialwarnstof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mm = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.muteenabledtof.name)
      .setLabel(msg.lan.muteenabledtof)
      .setStyle(r.muteenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const km = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.kickenabledtof.name)
      .setLabel(msg.lan.kickenabledtof)
      .setStyle(r.kickenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const bm = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.banenabledtof.name)
      .setLabel(msg.lan.banenabledtof)
      .setStyle(r.banenabledtof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channel = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.bpchannelid.name)
      .setLabel(msg.lan.bpchannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const role = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const maw = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.muteafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.muteafterwarnsamount.replace(/\*/g, ''), {
          amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Secondary);
    const kaw = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.kickafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.kickafterwarnsamount.replace(/\*/g, ''), {
          amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Secondary);
    const baw = new Discord.UnsafeButtonComponent()
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
