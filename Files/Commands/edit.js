const Builders = require('@discordjs/builders');

module.exports = {
  name: 'edit',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const warnNr = msg.args[1];
    const newReason = msg.args.slice(2).join(' ');

    const proceed = checkWarn(msg, warnNr);
    if (!proceed) return;

    const warn = await getWarn(msg, user, warnNr);
    if (!warn) return;

    editWarn(msg, warn, newReason);
    declareSuccess(msg, warn, user);
    doLog(msg, user, warn, newReason);
  },
};

const getWarn = async (msg, target, warnNr) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    msg.client.ch.query(
      'SELECT * FROM punish_warns WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
    msg.client.ch.query(
      'SELECT * FROM punish_kicks WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
    msg.client.ch.query(
      'SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
    msg.client.ch.query(
      'SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
    msg.client.ch.query(
      'SELECT * FROM punish_bans WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
    msg.client.ch.query(
      'SELECT * FROM punish_channelbans WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;',
      [msg.guild.id, target.id, warnNr],
    ),
  );

  const allWarns = [];
  if (warnRes && warnRes.rowCount) allWarns.concat(warnRes.rows);
  if (kickRes && kickRes.rowCount) allWarns.concat(kickRes.rows);
  if (muteRes && muteRes.rowCount) allWarns.concat(muteRes.rows);
  if (banRes && banRes.rowCount) allWarns.concat(banRes.rows);
  if (channelbanRes && channelbanRes.rowCount) allWarns.concat(channelbanRes.rows);

  if (!allWarns.length) {
    msg.client.ch.error(msg, msg.client.ch.stp(msg.lan.noWarn, { number: warnNr }));
    return false;
  }

  const warn = allWarns.rows.find((w) => w.uniquetimestamp === Number(warnNr));

  return warn;
};

const checkWarn = (msg, warnNr) => {
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
    .setColor(msg.client.constants.commands.edit.success)
    .setFooter({ text: msg.lan.punishmentIssue })
    .setTimestamp(Number(warn.uniquetimestamp));

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const doLog = (msg, user, warn, reason) => {
  const logEmbed = new Builders.UnsafeEmbedBuilder();
  const con = msg.client.constants.commands.edit;

  logEmbed
    .setDescription(`**${msg.language.reason}:**\n${warn.reason}`)
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.muteOf, { target: user }),
      iconURL: con.log.image,
      url: msg.url,
    })
    .addFields(
      {
        name: msg.lan.oldReason,
        value: warn.reason,
        inline: false,
      },
      {
        name: msg.lan.newReason,
        value: reason,
        inline: false,
      },
      {
        name: msg.lan.editedBy,
        value: `${msg.author.tag}\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
        inline: false,
      },
    )
    .setColor(con.log.color)
    .setFooter({ text: `${msg.lan.punishmentID} ${warn.uniquetimestamp}` });

  if (msg.logchannels) {
    msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logEmbed] }));
  }
};

const editWarn = async (msg, warn, newReason) => {
  await Promise.all([
    msg.client.ch.query(
      `UPDATE punish_warns SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
      [msg.guild.id, warn.userid, warn.uniquetimestamp, newReason],
    ),
    msg.client.ch.query(
      `UPDATE punish_kicks SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
      [msg.guild.id, warn.userid, warn.uniquetimestamp, newReason],
    ),
    msg.client.ch.query(
      `UPDATE punish_mutes SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
      [msg.guild.id, warn.userid, warn.uniquetimestamp, newReason],
    ),
    msg.client.ch.query(
      `UPDATE punish_bans SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
      [msg.guild.id, warn.userid, warn.uniquetimestamp, newReason],
    ),
    msg.client.ch.query(
      `UPDATE punish_channelbans SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
      [msg.guild.id, warn.userid, warn.uniquetimestamp, newReason],
    ),
  ]);
};
