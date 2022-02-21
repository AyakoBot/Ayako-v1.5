const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'check',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['warnlog'],
  type: 'mod',
  async execute(msg) {
    const user = msg.args[0]
      ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, ''))
      : msg.author;
    if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
    const member = await msg.guild.members.fetch(user.id).catch(() => {});
    const { lan } = msg;
    const con = msg.client.constants.commands[this.name];
    msg.con = con;

    msg.pages = { warn: 0, mute: 0, warnMax: 0, muteMax: 0 };

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.client.ch.stp(lan.author, { target: user }),
        iconURL: con.author.image,
        url: con.author.url,
      })
      .addField(lan.banLoad, msg.client.constants.emotes.loading);

    const count = { warns: 0, mutes: 0 };
    const options = { warns: [], mutes: [] };

    const res = await msg.client.ch.query(
      'SELECT * FROM warns WHERE userid = $1 AND guildid = $2 ORDER BY dateofwarn ASC;',
      [user.id, msg.guild.id],
    );
    if (res && res.rowCount > 0) {
      res.rows.forEach((r, i) => {
        res.rows[i].row_number = i;
      });
      res.rows.forEach((r) => {
        const dateOfWarn = new Date(Number(r.dateofwarn));
        if (r.type === 'Warn')
          options.warns.push({
            label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${
              msg.language.months[dateOfWarn.getMonth()]
            } ${dateOfWarn.getFullYear()}`,
            value: `${r.row_number}`,
          });
        if (r.type === 'Mute')
          options.mutes.push({
            label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${
              msg.language.months[dateOfWarn.getMonth()]
            } ${dateOfWarn.getFullYear()}`,
            value: `${r.row_number}`,
          });
      });
      if (res.rows.filter((row) => row.type === 'Warn').length) {
        count.warns = res.rows.filter((row) => row.type === 'Warn').length;
        msg.pages.warn = 1;
        msg.pages.warnMax = Math.ceil(options.warns.length / 25);
      }
      if (res.rows.filter((row) => row.type === 'Mute').length) {
        count.mutes = res.rows.filter((row) => row.type === 'Mute').length;
        msg.pages.mute = 1;
        msg.pages.muteMax = Math.ceil(options.mutes.length / 25);
      }
    }
    const take = { warns: [], mutes: [] };
    options.warns.forEach((r) => {
      take.warns.push(r);
    });
    options.mutes.forEach((r) => {
      take.mutes.push(r);
    });

    embed.setDescription(
      `${msg.client.ch.stp(lan.text, { warns: `${count.warns}`, mutes: `${count.mutes}` })}\n\n${
        msg.lan.warnsPage
      }: \`${msg.pages.warn}/${msg.pages.warnMax}\`\n${msg.lan.mutesPage}: \`${msg.pages.mute}/${
        msg.pages.muteMax
      }\``,
    );

    msg.m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: buttonOrder(take, msg, options, { mutes: [], warns: [] }),
    });

    const collector = msg.m.createMessageComponentCollector({ time: 60000 });
    const answered = { mutes: [], warns: [] };
    collector.on('collect', async (clickButton) => {
      if (clickButton.user.id !== msg.author.id) return msg.client.ch.notYours(clickButton);
      if (clickButton.customId === 'muteNext' || clickButton.customId === 'mutePrev') {
        let indexLast;
        let indexFirst;
        options.mutes.forEach((r, j) => {
          if (
            r.value ===
            clickButton.message.components[0].components[0].options[
              clickButton.message.components[0].components[0].options.length - 1
            ].value
          )
            indexLast = j;
          if (
            options.mutes[j] &&
            options.mutes[j].value ===
              clickButton.message.components[0].components[0].options[0].value
          )
            indexFirst = j;
        });
        take.mutes.splice(0, take.mutes.length);
        if (clickButton.customId === 'muteNext')
          for (let j = indexLast + 1; j < indexLast + 26; j += 1) {
            if (options.mutes[j]) take.mutes.push(options.mutes[j]);
          }
        if (clickButton.customId === 'mutePrev')
          for (let j = indexFirst - 25; j < indexFirst; j += 1) {
            if (options.mutes[j]) take.mutes.push(options.mutes[j]);
          }

        if (clickButton.customId === 'muteNext') {
          msg.pages.mute = +msg.pages.mute + 1;
        } else {
          msg.pages.mute = +msg.pages.mute - 1;
        }
        const newEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.author, { target: user }),
            iconURL: msg.con.author.image,
            url: msg.con.author.url,
          })
          .setDescription(
            `${msg.language.select.id.desc}\n\n${msg.lan.warnsPage}: \`${msg.pages.warn}/${msg.pages.warnMax}\`\n${msg.lan.mutesPage}: \`${msg.pages.mute}/${msg.pages.muteMax}\``,
          );
        clickButton
          .update({
            embeds: [newEmbed],
            components: buttonOrder(take, msg, options, answered, msg.pages.mute, null),
          })
          .catch(() => {});
      } else if (clickButton.customId === 'warnNext' || clickButton.customId === 'warnPrev') {
        let indexLast;
        let indexFirst;
        options.warns.forEach((r, j) => {
          if (
            r.value ===
            clickButton.message.components[0].components[0].options[
              clickButton.message.components[0].components[0].options.length - 1
            ].value
          )
            indexLast = j;
          if (r.value === clickButton.message.components[0].components[0].options[0].value) {
            indexFirst = j;
          }
        });
        take.warns.splice(0, take.warns.length);
        if (clickButton.customId === 'warnNext')
          for (let j = indexLast + 1; j < indexLast + 26; j += 1)
            if (options.warns[j]) take.warns.push(options.warns[j]);
        if (clickButton.customId === 'warnPrev')
          for (let j = indexFirst - 25; j < indexFirst; j += 1)
            if (options.warns[j]) take.warns.push(options.warns[j]);
        if (clickButton.customId === 'warnNext') {
          msg.pages.warn = +msg.pages.warn + 1;
        } else {
          msg.pages.warn = +msg.pages.warn - 1;
        }
        const newEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.author, { target: user }),
            iconURL: msg.con.author.image,
            url: msg.con.author.url,
          })
          .setDescription(
            `${msg.language.select.id.desc}\n\n${msg.lan.warnsPage}: \`${msg.pages.warn}/${msg.pages.warnMax}\`\n${msg.lan.mutesPage}: \`${msg.pages.mute}/${msg.pages.muteMax}\``,
          );
        clickButton
          .update({ embeds: [newEmbed], components: buttonOrder(take, msg, options, answered) })
          .catch(() => {});
      } else if (clickButton.customId === 'muteMenu') {
        clickButton.values.forEach((val) => {
          if (!answered.mutes.includes(val)) answered.mutes.push(val);
          else answered.mutes.splice(answered.mutes.indexOf(val), 1);
        });
        const newEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.author, { target: user }),
            iconURL: msg.con.author.image,
            url: msg.con.author.url,
          })
          .setDescription(
            `${msg.language.select.id.desc}\n\n${msg.lan.warnsPage}: \`${msg.pages.warn}/${msg.pages.warnMax}\`\n${msg.lan.mutesPage}: \`${msg.pages.mute}/${msg.pages.muteMax}\``,
          );
        if (answered.mutes.length === 0) newEmbed.fields = [];
        clickButton
          .update({ embeds: [newEmbed], components: buttonOrder(take, msg, options, answered) })
          .catch(() => {});
      } else if (clickButton.customId === 'warnMenu') {
        clickButton.values.forEach((val) => {
          if (!answered.warns.includes(val)) answered.warns.push(val);
          else answered.warns.splice(answered.warns.indexOf(val), 1);
        });
        const newEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.author, { target: user }),
            iconURL: msg.con.author.image,
            url: msg.con.author.url,
          })
          .setDescription(
            `${msg.language.select.id.desc}\n\n${msg.lan.warnsPage}: \`${msg.pages.warn}/${msg.pages.warnMax}\`\n${msg.lan.mutesPage}: \`${msg.pages.mute}/${msg.pages.muteMax}\``,
          );
        if (answered.warns.length === 0) newEmbed.fields = [];
        clickButton
          .update({ embeds: [newEmbed], components: buttonOrder(take, msg, options, answered) })
          .catch(() => {});
      } else if (clickButton.customId === 'done') {
        if (answered.mutes.length || answered.warns.length) {
          const embeds = [];
          if (answered.warns.length) {
            const WarnTitleEmbed = new Discord.MessageEmbed()
              .setTitle(msg.lan.warns)
              .setColor('#ffffff');
            embeds.push(WarnTitleEmbed);
            answered.warns.forEach((number) => {
              const warn = res.rows.filter((r) => r.row_number === Number(number))[0];
              const warnEmbed = new Discord.MessageEmbed()
                .setDescription(`**${msg.language.reason}:**\n${warn.reason}`)
                .setAuthor({
                  name: msg.lan.warnOf + user.tag,
                  iconURL: msg.con.author.image,
                  url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
                    guildid: msg.guild.id,
                    channelid: msg.channel.id,
                    msgid: warn.msgid,
                  }),
                })
                .addFields(
                  {
                    name: msg.lan.date,
                    value: `<t:${warn.dateofwarn.slice(0, -3)}:F> (<t:${warn.dateofwarn.slice(
                      0,
                      -3,
                    )}:R>)`,
                    inline: false,
                  },
                  {
                    name: msg.lan.warnedIn,
                    value: `<#${warn.warnedinchannelid}>\n\`${warn.warnedinchannelname}\``,
                    inline: false,
                  },
                  {
                    name: msg.lan.warnedBy,
                    value: `<@${warn.warnedbyuserid}>\n\`${warn.warnedbyusername}\` (\`${warn.warnedbyuserid}\`)`,
                    inline: false,
                  },
                )
                .setFooter({ text: msg.lan.warnID + warn.row_number });
              embeds.push(warnEmbed);
            });
          }
          if (answered.mutes.length) {
            const MuteTitleEmbed = new Discord.MessageEmbed()
              .setTitle(msg.lan.mutes)
              .setColor('#ffffff');
            embeds.push(MuteTitleEmbed);
            answered.mutes.forEach((number) => {
              const mute = res.rows.filter((r) => r.row_number === Number(number))[0];
              let notClosed = msg.client.ch.stp(msg.lan.notClosed, {
                time: `<t:${mute.duration.slice(0, -3)}:F> (<t:${mute.duration.slice(0, -3)}:R>)`,
              });
              if (member && member.isCommunicationDisabled()) {
                notClosed = msg.client.ch.stp(msg.lan.abortedMute, {
                  time: `<t:${mute.duration.slice(0, -3)}:F> (<t:${mute.duration.slice(0, -3)}:R>)`,
                });
              }
              let muteCloseText;
              if (mute.closed === true) {
                muteCloseText = msg.client.ch.stp(msg.lan.closed, {
                  time: `<t:${mute.duration.slice(0, -3)}:F> (<t:${mute.duration.slice(0, -3)}:R>)`,
                });
              } else if (mute.closed === false) {
                muteCloseText = notClosed;
              } else {
                muteCloseText = msg.language.never;
              }
              const muteEmbed = new Discord.MessageEmbed()
                .setDescription(`**${msg.language.reason}:**\n${mute.reason}`)
                .setAuthor({
                  name: msg.lan.muteOf + user.tag,
                  iconURL: msg.con.author.image,
                  url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
                    guildid: msg.guild.id,
                    channelid: msg.channel.id,
                    msgid: mute.msgid,
                  }),
                })
                .addFields(
                  {
                    name: msg.lan.date,
                    value: `<t:${mute.dateofwarn.slice(0, -3)}:F> (<t:${mute.dateofwarn.slice(
                      0,
                      -3,
                    )}:R>)`,
                    inline: false,
                  },
                  {
                    name: msg.lan.mutedIn,
                    value: `<#${mute.warnedinchannelid}>\n\`${mute.warnedinchannelname}\``,
                    inline: false,
                  },
                  {
                    name: msg.lan.mutedBy,
                    value: `<@${mute.warnedbyuserid}>\n\`${mute.warnedbyusername}\` (\`${mute.warnedbyuserid}\`)`,
                    inline: false,
                  },
                  {
                    name: msg.lan.duration,
                    value: `${
                      mute.duration
                        ? moment
                            .duration(+mute.duration - +mute.dateofwarn)
                            .format(
                              `d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                            )
                        : '∞'
                    }`,
                    inline: false,
                  },
                  {
                    name: msg.lan.muteclosed,
                    value: muteCloseText,
                    inline: false,
                  },
                )
                .setFooter({ text: msg.lan.warnID + mute.row_number });
              embeds.push(muteEmbed);
            });
          }
          clickButton.update({ embeds, components: [] });
        }
        collector.stop('finished');
      }
      return null;
    });
    collector.on('end', (collected, reason) => {
      if (reason === 'time') msg.m.edit({ embeds: msg.m.embeds, components: [] });
    });

    const ban = await msg.guild.bans.fetch(user.id).catch(() => {});
    embed.fields = [];
    if (ban && ban.guild)
      embed.addField(
        msg.client.ch.stp(lan.banned, { target: user }),
        `${msg.language.reason}:\n${ban.reason}`,
      );
    else embed.addField('\u200b', `**${msg.client.ch.stp(lan.notbanned, { target: user })}**`);
    return msg.m.edit({ embeds: [embed] });
  },
};

function buttonOrder(take, msg, options, answered) {
  const rawRows = [];
  if (take.warns.length) {
    const warnMenu = new Discord.MessageSelectMenu()
      .setCustomId('warnMenu')
      .addOptions(take.warns)
      .setMinValues(1)
      .setMaxValues(take.warns.length < 8 ? take.warns.length : 8)
      .setPlaceholder(
        `${answered.warns.length ? answered.warns.sort((a, b) => a - b) : msg.lan.selWarns}`,
      );
    const warnNext = new Discord.MessageButton()
      .setCustomId('warnNext')
      .setLabel(msg.language.next)
      .setDisabled(options.warns.length < msg.pages.warn * 25 + 26)
      .setStyle('SUCCESS');
    const warnPrev = new Discord.MessageButton()
      .setCustomId('warnPrev')
      .setLabel(msg.language.prev)
      .setDisabled(msg.pages.warn === 1)
      .setStyle('DANGER');
    rawRows.push([warnMenu], [warnPrev, warnNext]);
    if (msg.pages.warn >= Math.ceil(+options.warns.length / 25)) warnNext.setDisabled(true);
    else warnNext.setDisabled(false);
    if (msg.pages.warn > 1) warnPrev.setDisabled(false);
    else warnPrev.setDisabled(true);
  }
  if (take.mutes.length) {
    const muteMenu = new Discord.MessageSelectMenu()
      .setCustomId('muteMenu')
      .addOptions(take.mutes)
      .setMinValues(1)
      .setMaxValues(take.mutes.length < 8 ? take.mutes.length : 8)
      .setPlaceholder(
        `${answered.mutes.length ? answered.mutes.sort((a, b) => a - b) : msg.lan.selMutes}`,
      );
    const muteNext = new Discord.MessageButton()
      .setCustomId('muteNext')
      .setLabel(msg.language.next)
      .setDisabled(options.mutes.length < msg.pages.mute * 25 + 26)
      .setStyle('SUCCESS');
    const mutePrev = new Discord.MessageButton()
      .setCustomId('mutePrev')
      .setLabel(msg.language.prev)
      .setDisabled(msg.pages.mute === 1)
      .setStyle('DANGER');
    rawRows.push([muteMenu], [mutePrev, muteNext]);
    if (msg.pages.mute >= Math.ceil(+options.mutes.length / 25)) muteNext.setDisabled(true);
    else muteNext.setDisabled(false);
    if (msg.pages.mute > 1) mutePrev.setDisabled(false);
    else mutePrev.setDisabled(true);
  }
  if (take.warns.length || take.mutes.length) {
    const done = new Discord.MessageButton()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setStyle('PRIMARY');
    if (answered.warns.length || answered.mutes.length) done.setDisabled(false);
    else done.setDisabled(true);
    rawRows.push([done]);
  }
  const rows = msg.client.ch.buttonRower(rawRows);
  return rows;
}
