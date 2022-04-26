const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'pardon',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: ['removewarn'],
  type: 'mod',
  async execute(msg) {
    const pNr = parseInt(msg.args[0], 32);

    const proceed = await checkWarn(msg, pNr);
    if (!proceed) return;

    const p = await getWarn(msg, pNr);
    if (!p) return;

    deleteWarn(msg, p);

    const user = await msg.client.users.fetch(p.userid).catch(() => {});

    declareSuccess(msg, p, user);
    doLog(msg, p, user);
  },
};

const getWarn = async (msg, pNr) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map(async (table) =>
      msg.client.ch.query(
        `SELECT * FROM punish_${table} WHERE guildid = $1 AND uniquetimestamp = $2;`,
        [msg.guild.id, String(pNr)],
      ),
    ),
  );

  let allWarns = [];
  if (warnRes && warnRes.rowCount) allWarns = allWarns.concat(warnRes.rows);
  if (kickRes && kickRes.rowCount) allWarns = allWarns.concat(kickRes.rows);
  if (muteRes && muteRes.rowCount) allWarns = allWarns.concat(muteRes.rows);
  if (banRes && banRes.rowCount) allWarns = allWarns.concat(banRes.rows);
  if (channelbanRes && channelbanRes.rowCount) allWarns = allWarns.concat(channelbanRes.rows);

  if (!allWarns.length) {
    msg.client.ch.error(msg, msg.client.ch.stp(msg.lan.noPunishment, { number: pNr }));
    return false;
  }

  const p = allWarns.find((w) => Number(w.uniquetimestamp) === Number(pNr));

  return p;
};

const checkWarn = async (msg) => {
  if (msg.args[0].toLowerCase() === msg.language.all) {
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return false;
    }

    msg.client.commands.get('clearwarns').execute(msg);
    return false;
  }

  return true;
};

const declareSuccess = (msg, p, user) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      msg.client.ch.stp(msg.lan.done, {
        number: Number(p.uniquetimestamp).toString(32),
        target: user,
      }),
    )
    .setColor(msg.client.constants.commands.pardon.success)
    .setFooter({ text: msg.lan.punishmentIssue })
    .setTimestamp(Number(p.uniquetimestamp));

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const doLog = (msg, p, user) => {
  const logEmbed = new Builders.UnsafeEmbedBuilder();
  const con = msg.client.constants.commands.pardon;

  logEmbed
    .setDescription(`**${msg.language.reason}:**\n${p.reason}`)
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.punishmentOf, { target: user }),
      iconURL: con.log.image,
      url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
        guildid: msg.guild.id,
        channelid: p.channelid,
        msgid: p.msgid,
      }),
    })
    .addFields(
      {
        name: msg.lan.date,
        value: `<t:${p.uniquetimestamp.slice(0, -3)}:F> (<t:${p.uniquetimestamp.slice(0, -3)}:R>)`,
        inline: false,
      },
      {
        name: msg.lan.punishedIn,
        value: `<#${p.channelid}>\n\`${p.channelname}\` (\`${p.channelid}\`)`,
        inline: false,
      },
      {
        name: msg.lan.punishedBy,
        value: `<@${p.executorid}>\n\`${p.executorname}\` (\`${p.executorid}\`)`,
        inline: false,
      },
      {
        name: msg.lan.pardonedBy,
        value: `${msg.author}\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
        inline: false,
      },
    )
    .setColor(con.log.color)
    .setFooter({ text: `${msg.lan.punishmentID}${Number(p.uniquetimestamp).toString(32)}` });

  if (p.duration) {
    logEmbed.addFields(
      {
        name: msg.lan.duration,
        value: `${
          p.duration
            ? moment
                .duration(Number(p.duration))
                .format(
                  `d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                )
            : '∞'
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.client.ch.stp(msg.lan.closed, {
          time: `<t:${
            Number(p.uniquetimestamp.slice(0, -3)) + Number(p.duration.slice(0, -3))
          }:F> (<t:${Number(p.uniquetimestamp.slice(0, -3)) + Number(p.duration.slice(0, -3))}:R>)`,
        }),
        inline: false,
      },
    );
  }

  if (msg.logchannels) {
    msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logEmbed] }));
  }
};

const deleteWarn = async (msg, p) => {
  await Promise.all(
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(
        `DELETE FROM punish_${table} WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
        [msg.guild.id, p.userid, p.uniquetimestamp],
      ),
    ),
  );
};
