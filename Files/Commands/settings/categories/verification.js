const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    if (r.greetdesc && r.greetdesc.startsWith('{"') && r.greetdesc.endsWith('"}')) {
      r.greetdesc = r.greetdesc.slice(2, r.greetdesc.length - 2);
    }
    if (r.finishdesc && r.finishdesc.startsWith('{"') && r.finishdesc.endsWith('"}')) {
      r.finishdesc = r.finishdesc.slice(2, r.finishdesc.length - 2);
    }
    const embed = new Discord.UnsafeEmbed().addFields([
      {
        name: msg.lanSettings.active,
        value: r.active
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
        name: msg.lan.selfstart,
        value: r.selfstart
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.kicktof,
        value: r.kicktof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.kickafter,
        value: `${r.kickafter} ${msg.language.time.minutes}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.logchannel,
        value: r.logchannel ? `<#${r.logchannel}>` : msg.language.none,
        inline: true,
      },
      {
        name: msg.lan.finishedrole,
        value: r.finishedrole ? `<@&${r.finishedrole}>` : msg.language.none,
        inline: true,
      },
      {
        name: msg.lan.pendingrole,
        value: r.pendingrole ? `<@&${r.pendingrole}>` : msg.language.none,
        inline: true,
      },
      {
        name: msg.lan.startchannel,
        value: r.startchannel ? `<#${r.startchannel}>` : msg.language.none,
        inline: true,
      },
    ]);

    if (msg.lan.startchannel) {
      embed.addFields({
        name: msg.lan.deletestartchmsgs,
        value: r.deletestartchmsgs
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      });
    }

    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kicktof = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.kicktof.name)
      .setLabel(msg.lan.kicktof)
      .setStyle(r.kicktof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kickafter = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.kickafter.name)
      .setLabel(msg.lan.kickafter)
      .setStyle(Discord.ButtonStyle.Secondary);
    const selfstart = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.selfstart.name)
      .setLabel(msg.lan.selfstart)
      .setStyle(r.selfstart ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const logchannel = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.logchannel.name)
      .setLabel(msg.lan.logchannel)
      .setStyle(Discord.ButtonStyle.Secondary);
    const startchannel = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.startchannel.name)
      .setLabel(msg.lan.startchannel)
      .setStyle(r.startchannel ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const deleteMsgs = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.deletestartchmsgs.name)
      .setLabel(msg.lan.deletestartchmsgs)
      .setStyle(r.deletestartchmsgs ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const finishedrole = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.finishedrole.name)
      .setLabel(msg.lan.finishedrole)
      .setStyle(r.finishedrole ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const pendingrole = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.pendingrole.name)
      .setLabel(msg.lan.pendingrole)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [
      [active],
      [selfstart, kicktof, kickafter],
      [logchannel, finishedrole, pendingrole, startchannel],
      [deleteMsgs],
    ];
  },
  doMoreThings(msg, r, name) {
    if (name === 'startchannel') {
      const channel = msg.guild.channels.cache.get(r.startchannel);
      if (channel) {
        const lan = msg.language.verification;
        const embed = new Discord.UnsafeEmbed()
          .setAuthor({
            name: lan.author.name,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            msg.client.ch.stp(lan.startchannelmessage, {
              prefix: msg.client.constants.standard.prefix,
            }),
          )
          .setColor(msg.client.constants.standard.color);

        msg.client.ch.send(channel, { embeds: [embed] });
      }
    }
  },
};
