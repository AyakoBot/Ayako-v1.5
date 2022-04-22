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
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const warnNr = msg.args[1];

    const proceed = checkWarn(msg, warnNr);
    if (!proceed) return;

    const warn = await getWarn(msg, user, warnNr);
    if (!warn) return;

    deleteWarn(msg, warn);
    declareSuccess(msg, warn, user);
    doLog(msg, warn, user);
  },
};

const getWarn = async (msg, target, warnNr) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    ['warns', 'kicks', 'mutes', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(
        `SELECT * FROM punish_${table} WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
        [msg.guild.id, target.id, warnNr],
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
    msg.client.ch.error(msg, msg.client.ch.stp(msg.lan.noPunishment, { number: warnNr }));
    return false;
  }

  const warn = allWarns.find((w) => w.uniquetimestamp === Number(warnNr));

  return warn;
};

const checkWarn = (msg, warnNr) => {
  if (warnNr.toLowerCase() === msg.language.all) {
    msg.client.commands.get('clearwarns').execute(msg);
    return false;
  }

  if (Number.isNaN(Number(warnNr))) {
    msg.client.ch.error(
      msg,
      msg.client.ch.stp(msg.language.noNumber, { arg: msg.args[1] ? msg.args[1] : '-' }),
    );
    return false;
  }

  return true;
};

const declareSuccess = (msg, warn, user) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(msg.client.ch.stp(msg.lan.done, { number: warn.uniquetimestamp, target: user }))
    .setColor(msg.client.constants.commands.pardon.success)
    .setFooter({ text: msg.lan.punishmentIssue })
    .setTimestamp(Number(warn.uniquetimestamp));

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const doLog = (msg, warn, user) => {
  const logEmbed = new Builders.UnsafeEmbedBuilder();
  const con = msg.client.constants.commands.pardon;

  logEmbed
    .setDescription(`**${msg.language.reason}:**\n${warn.reason}`)
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.punishmentOf, { target: user }),
      iconURL: con.log.image,
      url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
        guildid: msg.guild.id,
        channelid: warn.channelid,
        msgid: warn.msgid,
      }),
    })
    .addFields(
      {
        name: msg.lan.date,
        value: `<t:${warn.uniquetimestamp.slice(0, -3)}:F> (<t:${warn.uniquetimestamp.slice(
          0,
          -3,
        )}:R>)`,
        inline: false,
      },
      {
        name: msg.lan.punishedIn,
        value: `<#${warn.channelid}>\n\`${warn.channelname}\` (\`${warn.channelid}\`)`,
        inline: false,
      },
      {
        name: msg.lan.punishedBy,
        value: `<@${warn.executorid}>\n\`${warn.executorname}\` (\`${warn.executorid}\`)`,
        inline: false,
      },
      {
        name: msg.lan.pardonedBy,
        value: `${msg.author.tag}\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
        inline: false,
      },
    )
    .setColor(con.log.color)
    .setFooter({ text: msg.lan.warnID + warn.row_number });

  if (warn.duration) {
    logEmbed.addFields(
      {
        name: msg.lan.duration,
        value: `${
          warn.duration
            ? moment
                .duration(Number(warn.duration))
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
          time: `<t:${warn.duration.slice(0, -3)}:F> (<t:${warn.duration.slice(0, -3)}:R>)`,
        }),
        inline: false,
      },
    );
  }

  if (msg.logchannels) {
    msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logEmbed] }));
  }
};

const deleteWarn = async (msg, warn) => {
  await Promise.all(
    ['warns', 'kicks', 'mutes', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(
        `DELETE FROM punish_${table} WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
        [msg.guild.id, warn.userid, warn.uniquetimestamp],
      ),
    ),
  );
};
