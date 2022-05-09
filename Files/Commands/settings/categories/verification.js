const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  helpCategory: 'util',
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
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.selfstart,
        value: r.selfstart
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.kicktof,
        value: r.kicktof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
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
    );

    return embed;
  },
  buttons(msg, r) {
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kicktof = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kicktof.name)
      .setLabel(msg.lan.kicktof)
      .setStyle(r.kicktof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kickafter = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kickafter.name)
      .setLabel(msg.lan.kickafter)
      .setStyle(Discord.ButtonStyle.Secondary);
    const selfstart = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.selfstart.name)
      .setLabel(msg.lan.selfstart)
      .setStyle(r.selfstart ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const logchannel = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.logchannel.name)
      .setLabel(msg.lan.logchannel)
      .setStyle(Discord.ButtonStyle.Secondary);
    const startchannel = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.startchannel.name)
      .setLabel(msg.lan.startchannel)
      .setStyle(r.startchannel ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const finishedrole = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.finishedrole.name)
      .setLabel(msg.lan.finishedrole)
      .setStyle(r.finishedrole ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const pendingrole = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.pendingrole.name)
      .setLabel(msg.lan.pendingrole)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [
      [active],
      [selfstart, kicktof, kickafter],
      [logchannel, finishedrole, pendingrole, startchannel],
    ];
  },
  doMoreThings(msg, insertedValues, changedKey) {
    if (changedKey === 'startchannel') {
      const channel = msg.guild.channels.cache.get(insertedValues.startchannel);
      if (channel) {
        const lan = msg.language.verification;
        const embed = new Builders.UnsafeEmbedBuilder()
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

        const verify = new Builders.UnsafeButtonBuilder()
          .setLabel(lan.verify)
          .setCustomId('verify_message_button')
          .setStyle(Discord.ButtonStyle.Success);

        msg.client.ch.send(channel, {
          embeds: [embed],
          components: msg.client.ch.buttonRower([verify]),
        });
      }
    }
  },
};
