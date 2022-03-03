const Discord = require('discord.js');

module.exports = {
  perm: 8192n,
  type: 1,
  finished: true,
  category: ['auto-moderation'],
  displayEmbed(msg, r) {
    let wordText = '';
    const wordArr = [];
    if (r.words && r.words.length) {
      for (let i = 0; i < r.words.length; i += 1) {
        wordArr[i] = `${r.words[i]}⠀`;
        wordText += wordArr[i] + new Array(22 - wordArr[i].length).join(' ');
      }
    } else wordText = msg.language.none;
    const embed = new Discord.UnsafeEmbed().addFields([
      {
        name: msg.lanSettings.active,
        value: `${
          r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        inline: false,
      },
      {
        name: msg.lan.words,
        value: `${
          r.words && r.words.length ? msg.client.ch.makeCodeBlock(wordText) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
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
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.warntof,
        value: `${
          r.warntof
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }\n`,
        inline: true,
      },
      {
        name: msg.lan.mutetof,
        value: `${
          r.mutetof
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        inline: true,
      },
      {
        name: msg.lan.kicktof,
        value: `${
          r.kicktof
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        inline: true,
      },
      {
        name: msg.lan.bantof,
        value: `${
          r.bantof
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        inline: true,
      },
      {
        name: '\u200b',
        value:
          `${msg.client.ch.stp(msg.lan.warnafter, {
            amount: r.warnafter ? r.warnafter : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.muteafter, {
            amount: r.muteafter ? r.muteafter : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.kickafter, {
            amount: r.kickafter ? r.kickafter : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.banafter, { amount: r.banafter ? r.banafter : '--' })}`,
        inline: false,
      },
    ]);
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const wm = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.warntof.name)
      .setLabel(msg.lan.warntof)
      .setStyle(r.warntof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mm = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.mutetof.name)
      .setLabel(msg.lan.mutetof)
      .setStyle(r.mutetof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const km = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.kicktof.name)
      .setLabel(msg.lan.kicktof)
      .setStyle(r.kicktof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const bm = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bantof.name)
      .setLabel(msg.lan.bantof)
      .setStyle(r.bantof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channel = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bpchannelid.name)
      .setLabel(msg.lan.bpchannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const role = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const maw = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.muteafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.muteafter.replace(/\*/g, ''), {
          amount: r.muteafter ? r.muteafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const kaw = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.kickafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.kickafter.replace(/\*/g, ''), {
          amount: r.kickafter ? r.kickafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const baw = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.banafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.banafter.replace(/\*/g, ''), {
          amount: r.banafter ? r.banafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const words = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.words.name)
      .setLabel(msg.lan.words.replace(/\*/g, ''))
      .setStyle(Discord.ButtonStyle.Primary);
    const waw = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.warnafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.warnafter.replace(/\*/g, ''), {
          amount: r.warnafter ? r.warnafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);

    return [
      [active, words],
      [channel, user, role],
      [wm, mm, km, bm],
      [waw, maw, kaw, baw],
    ];
  },
};
