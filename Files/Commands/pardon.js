const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'pardon',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
    const warnNr = msg.args[1];
    if (warnNr.toLowerCase() === msg.language.all)
      return msg.client.commands.get('clearwarns').execute(msg);
    if (Number.isNaN(Number(warnNr)))
      return msg.client.ch.reply(
        msg,
        msg.client.ch.stp(msg.language.noNumber, { arg: msg.args[1] ? msg.args[1] : '-' }),
      );
    const res = await msg.client.ch.query(
      'SELECT * FROM warns WHERE userid = $1 AND guildid = $2 ORDER BY dateofwarn ASC;',
      [user.id, msg.guild.id],
    );
    if (!res || res.rowCount === 0)
      return msg.client.ch.reply(msg, msg.client.ch.stp(msg.lan.noWarn, { number: warnNr }));
    res.rows.forEach((r, i) => {
      res.rows[i].row_number = i;
    });
    const warn = res.rows[warnNr];
    if (!warn)
      return msg.client.ch.reply(msg, msg.client.ch.stp(msg.lan.noWarn, { number: warnNr }));
    const embed = new Discord.MessageEmbed()
      .setDescription(msg.client.ch.stp(msg.lan.done, { number: warnNr, target: user }))
      .setColor(msg.client.constants.commands.pardon.success)
      .setFooter({ text: msg.lan.warnIssue })
      .setTimestamp(Number(warn.dateofwarn));
    msg.client.ch.reply(msg, { embeds: [embed] });
    const logEmbed = new Discord.MessageEmbed();
    const con = msg.client.constants.commands.pardon;
    if (warn.type === 'Warn') {
      logEmbed
        .setDescription(`**${msg.language.reason}:**\n${warn.reason}`)
        .setAuthor({
          name: msg.client.ch.stp(msg.lan.warnOf, { target: user }),
          iconURL: con.log.image,
          url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
            guildid: msg.guild.id,
            channelid: msg.channel.id,
            msgid: warn.msgid,
          }),
        })
        .addFields(
          {
            name: msg.lan.date,
            value: `<t:${warn.dateofwarn.slice(0, -3)}:F> (<t:${warn.dateofwarn.slice(0, -3)}:R>)`,
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
          {
            name: msg.lan.pardonedBy,
            value: `<@${msg.author.id}>\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
            inline: false,
          },
        )
        .setColor(con.log.color)
        .setFooter({ text: msg.lan.warnID + warn.row_number });
    } else if (warn.type === 'Mute') {
      const member = await msg.guild.members.fetch(user.id).catch(() => {});
      let notClosed = msg.client.ch.stp(msg.lan.notClosed, {
        time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
      });
      if (member && member.isCommunicationDisabled())
        notClosed = msg.client.ch.stp(msg.lan.abortedMute, {
          time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
        });
      let warnClosedText;
      if (warn.closed === true) {
        warnClosedText = msg.client.ch.stp(msg.lan.closed, {
          time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
        });
      } else if (warn.closed === false) warnClosedText = notClosed;
      else warnClosedText = msg.language.never;

      logEmbed
        .setDescription(`**${msg.language.reason}:**\n${warn.reason}`)
        .setAuthor({
          name: msg.client.ch.stp(msg.lan.muteOf, { target: user }),
          iconURL: con.log.image,
          url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
            guildid: msg.guild.id,
            channelid: msg.channel.id,
            msgid: warn.msgid,
          }),
        })
        .addFields(
          {
            name: msg.lan.date,
            value: `<t:${warn.dateofwarn.slice(0, -3)}:F> (<t:${warn.dateofwarn.slice(0, -3)}:R>)`,
            inline: false,
          },
          {
            name: msg.lan.mutedIn,
            value: `<#${warn.warnedinchannelid}>\n\`${warn.warnedinchannelname}\``,
            inline: false,
          },
          {
            name: msg.lan.mutedBy,
            value: `<@${warn.warnedbyuserid}>\n\`${warn.warnedbyusername}\` (\`${warn.warnedbyuserid}\`)`,
            inline: false,
          },
          {
            name: msg.lan.duration,
            value: `${
              warn.duration
                ? moment
                    .duration(+warn.duration - +warn.dateofwarn)
                    .format(
                      `d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                    )
                : '∞'
            }`,
            inline: false,
          },
          {
            name: msg.lan.warnclosed,
            value: warnClosedText,
            inline: false,
          },
          {
            name: msg.lan.pardonedBy,
            value: `<@${msg.author.id}>\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
            inline: false,
          },
        )
        .setColor(con.log.color)
        .setFooter({ text: msg.lan.warnID + warn.row_number });
    }
    msg.client.ch.query(
      'DELETE FROM warns WHERE userid = $1 AND guildid = $2 AND dateofwarn = $3;',
      [user.id, msg.guild.id, warn.dateofwarn],
    );
    if (msg.logchannels) {
      msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logEmbed] }));
    }
    return null;
  },
};
