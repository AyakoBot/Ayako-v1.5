const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  execute: async () => {
    const client = require('../../../BaseClient/DiscordClient');
    const settingsRes = await client.ch.query(
      `SELECT * FROM modsettings WHERE expirewarns = true AND expirewarnsafter IS NOT NULL OR expiremutes = true AND expiremutesafter IS NOT NULL;`,
    );

    if (!settingsRes || !settingsRes.rowCount) return;

    settingsRes.rows.forEach(async (settingsRow) => {
      if (!client.guilds.cache.get(settingsRow.guildid)) return;
      if (settingsRow.expirewarns && settingsRow.expirewarnsafter) doWarns(settingsRow, client);
      if (settingsRow.expiremutes && settingsRow.expiremutesafter) doMutes(settingsRow, client);
    });
  },
};

const doWarns = async (settingsRow, client) => {
  const { guildid } = settingsRow;

  const warnRes = await client.ch.query(
    `SELECT * FROM warns WHERE guildid = $1 AND dateofwarn < $2 AND type = 'Warn';`,
    [guildid, Date.now() - settingsRow.expirewarnsafter],
  );

  if (!warnRes || !warnRes.rowCount) return;

  warnRes.rows.forEach((row) => {
    client.ch.query(`DELETE FROM warns WHERE dateofwarn = $1 AND type = 'Warn' AND guildid = $2;`, [
      row.dateofwarn,
      guildid,
    ]);
  });

  logExpire(warnRes.rows, client, guildid);
};

const doMutes = async (settingsRow, client) => {
  const { guildid } = settingsRow;

  const muteRes = await client.ch.query(
    `SELECT * FROM warns WHERE guildid = $1 AND dateofwarn < $2 AND type = 'Mute' AND closed = true;`,
    [guildid, Date.now() - settingsRow.expiremutesafter],
  );

  if (!muteRes || !muteRes.rowCount) return;

  muteRes.rows.forEach((row) => {
    client.ch.query(`DELETE FROM warns WHERE dateofwarn = $1 AND type = 'Mute' AND guildid = $2;`, [
      row.dateofwarn,
      guildid,
    ]);
  });

  logExpire(muteRes.rows, client, guildid);
};

const logExpire = async (rows, client, guildid) => {
  const logchannelRes = await client.ch.query(
    `SELECT modlogs FROM logchannels WHERE guildid = $1;`,
    [guildid],
  );

  if (!logchannelRes || !logchannelRes.rowCount) return;

  const logchannels = logchannelRes.rows[0].modlogs.map((id) => client.channels.cache.get(id));
  const guild = client.guilds.cache.get(guildid);

  await Promise.all(rows.map((warn) => client.users.fetch(warn.userid).catch(() => {})));
  await Promise.all(
    rows.map((warn) =>
      client.guilds.cache
        .get(guildid)
        .members.fetch(warn.userid)
        .catch(() => {}),
    ),
  );

  const language = await client.ch.languageSelector(client.guilds.cache.get(guildid));
  const lan = language.expire;
  const con = client.constants.expire;

  const embeds = rows.map((warn, i) => {
    warn.row_number = i;
    const embed = new Discord.MessageEmbed();
    const user = client.users.cache.get(warn.userid);

    if (warn.type === 'Warn') {
      embed
        .setDescription(`**${language.reason}:**\n${warn.reason}`)
        .setAuthor({
          name: client.ch.stp(lan.warnOf, { target: user }),
          iconURL: con.log.image,
          url: client.ch.stp(client.constants.standard.discordUrlDB, {
            guildid: guild.id,
            channelid: warn.warnedinchannelid,
            msgid: warn.msgid,
          }),
        })
        .addFields(
          {
            name: lan.date,
            value: `<t:${warn.dateofwarn.slice(0, -3)}:F> (<t:${warn.dateofwarn.slice(0, -3)}:R>)`,
            inline: false,
          },
          {
            name: lan.warnedIn,
            value: `<#${warn.warnedinchannelid}>\n\`${warn.warnedinchannelname}\` (\`${warn.warnedinchannelid}\`)`,
            inline: false,
          },
          {
            name: lan.warnedBy,
            value: `<@${warn.warnedbyuserid}>\n\`${warn.warnedbyusername}\` (\`${warn.warnedbyuserid}\`)`,
            inline: false,
          },
          {
            name: lan.expired,
            value: `${client.user.tag}\n\`${client.user.username}\` (\`${client.user.id}\`)`,
            inline: false,
          },
        )
        .setColor(con.log.color)
        .setFooter({ text: lan.warnID + warn.row_number });
    } else if (warn.type === 'Mute') {
      const member = guild.members.cache.get(user.id).catch(() => {});
      let notClosed = client.ch.stp(lan.notClosed, {
        time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
      });
      if (member && member.isCommunicationDisabled())
        notClosed = client.ch.stp(lan.abortedMute, {
          time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
        });
      let warnClosedText;
      if (warn.closed === true) {
        warnClosedText = client.ch.stp(lan.closed, {
          time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
        });
      } else if (warn.closed === false) warnClosedText = notClosed;
      else warnClosedText = language.never;

      embed
        .setDescription(`**${language.reason}:**\n${warn.reason}`)
        .setAuthor({
          name: client.ch.stp(lan.muteOf, { target: user }),
          iconURL: con.log.image,
          url: client.ch.stp(client.constants.standard.discordUrlDB, {
            guildid: guild.id,
            channelid: warn.warnedinchannelid,
            msgid: warn.msgid,
          }),
        })
        .addFields(
          {
            name: lan.date,
            value: `<t:${warn.dateofwarn.slice(0, -3)}:F> (<t:${warn.dateofwarn.slice(0, -3)}:R>)`,
            inline: false,
          },
          {
            name: lan.mutedIn,
            value: `<#${warn.warnedinchannelid}>\n\`${warn.warnedinchannelname}\` (\`${warn.warnedinchannelid}\`)`,
            inline: false,
          },
          {
            name: lan.mutedBy,
            value: `<@${warn.warnedbyuserid}>\n\`${warn.warnedbyusername}\` (\`${warn.warnedbyuserid}\`)`,
            inline: false,
          },
          {
            name: lan.duration,
            value: `${
              warn.duration
                ? moment
                    .duration(+warn.duration - +warn.dateofwarn)
                    .format(
                      `d [${language.time.days}], h [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                    )
                : '∞'
            }`,
            inline: false,
          },
          {
            name: lan.warnclosed,
            value: warnClosedText,
            inline: false,
          },
          {
            name: lan.pardonedBy,
            value: `${client.user.tag}\n\`${client.user.username}\` (\`${client.user.id}\`)`,
            inline: false,
          },
        )
        .setColor(con.log.color)
        .setFooter({ text: lan.warnID + warn.row_number });
    }
    return embed;
  });

  const chunks = chunker(embeds);

  chunks.forEach((chunk) => client.ch.send(logchannels, { embeds: chunk }));
};

const chunker = (inputArray) => {
  const perChunk = 10;

  const result = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
};
