const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = async () => {
  const client = require('../../../BaseClient/DiscordClient');
  const settingsRes = await client.ch.query(
    `SELECT * FROM modsettings WHERE warns = true AND warnstime IS NOT NULL OR mutes = true AND mutestime IS NOT NULL OR kicks = true AND kickstime IS NOT NULL OR channelbans = true AND channelbanstime IS NOT NULL OR bans = true AND banstime IS NOT NULL;`,
  );

  if (!settingsRes || !settingsRes.rowCount) return;

  settingsRes.rows.forEach(async (settingsRow) => {
    if (!client.guilds.cache.get(settingsRow.guildid)) return;
    if (settingsRow.warns && settingsRow.warnstime) {
      expire(
        { expire: settingsRow.warnstime, guildid: settingsRow.guildid },
        client,
        'punish_warns',
      );
    }
    if (settingsRow.mutes && settingsRow.mutestime) {
      expire(
        { expire: settingsRow.mutestime, guildid: settingsRow.guildid },
        client,
        'punish_mutes',
      );
    }
    if (settingsRow.kicks && settingsRow.kickstime) {
      expire(
        { expire: settingsRow.kickstime, guildid: settingsRow.guildid },
        client,
        'punish_kicks',
      );
    }
    if (settingsRow.bans && settingsRow.banstime) {
      expire({ expire: settingsRow.banstime, guildid: settingsRow.guildid }, client, 'punish_bans');
    }
    if (settingsRow.channelbans && settingsRow.channelbanstime) {
      expire(
        { expire: settingsRow.channelbans, guildid: settingsRow.guildid },
        client,
        'punish_channelbans',
      );
    }
  });
};

const expire = async (row, client, tableName) => {
  const res = await client.ch.query(
    `SELECT * FROM ${tableName} WHERE guildid = $1 AND uniquetimestamp < $2;`,
    [row.guildid, Date.now() - row.expire],
  );

  if (!res || !res.rowCount) return;

  res.rows.forEach((r) => {
    client.ch.query(`DELETE FROM ${tableName} WHERE uniquetimestamp = $1 AND guildid = $2;`, [
      r.uniquetimestamp,
      r.guildid,
    ]);
  });

  logExpire(res.rows, client, row.guildid);
};

const logExpire = async (rows, client, guildid) => {
  const logchannelRes = await client.ch.query(
    `SELECT modlogs FROM logchannels WHERE guildid = $1;`,
    [guildid],
  );

  if (!logchannelRes || !logchannelRes.rowCount) return;

  const logchannels = logchannelRes.rows[0].modlogs.map((id) => client.channels.cache.get(id));
  const guild = client.guilds.cache.get(guildid);

  await Promise.all(rows.map((p) => client.users.fetch(p.userid).catch(() => {})));
  await Promise.all(
    rows.map((p) =>
      client.guilds.cache
        .get(guildid)
        .members.fetch(p.userid)
        .catch(() => {}),
    ),
  );

  const language = await client.ch.languageSelector(client.guilds.cache.get(guildid));
  const lan = language.expire;
  const con = client.constants.expire;

  await Promise.all(rows.map((r) => client.users.fetch(r.userid).catch(() => {})));

  const embeds = rows.map((p) => {
    const embed = new Builders.UnsafeEmbedBuilder();
    const user = client.users.cache.get(p.userid);

    const endedAt = client.ch.stp(lan.endedAt, {
      time: `<t:${(Number(p.uniquetimestamp) + Number(p.duration)).slice(0, -3)}:F> (<t:${(
        Number(p.uniquetimestamp) + Number(p.duration)
      ).slice(0, -3)}:R>)`,
    });

    embed
      .setDescription(`**${language.reason}:**\n${p.reason}`)
      .setAuthor({
        name: client.ch.stp(lan.punishmentOf, { target: user }),
        iconURL: con.log.image,
        url: client.ch.stp(client.constants.standard.discordUrlDB, {
          guildid: guild.id,
          channelid: p.channelid,
          msgid: p.msgid,
        }),
      })
      .addFields(
        {
          name: lan.punishmentIssue,
          value: `<t:${p.uniquetimestamp.slice(0, -3)}:F> (<t:${p.uniquetimestamp.slice(
            0,
            -3,
          )}:R>)`,
          inline: false,
        },
        {
          name: lan.punishmentIn,
          value: `<#${p.channelid}>\n\`${p.channelname}\` (\`${p.channelid}\`)`,
          inline: false,
        },
        {
          name: lan.punishmentBy,
          value: `<@${p.executorid}>\n\`${p.executorname}\` (\`${p.executorid}\`)`,
          inline: false,
        },
        {
          name: lan.duration,
          value: `${
            p.duration
              ? moment
                  .duration(Number(p.duration))
                  .format(
                    `d [${language.time.days}], h [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  )
              : '∞'
          }`,
          inline: false,
        },
        {
          name: lan.end,
          value: endedAt,
          inline: false,
        },
        {
          name: lan.pardonedBy,
          value: `${client.user.tag}\n\`${client.user.username}\` (\`${client.user.id}\`)`,
          inline: false,
        },
      )
      .setColor(con.log.color);

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
