const Builders = require('@discordjs/builders');

module.exports = {
  name: 'edit',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const pNr = parseInt(msg.args[0], 32);
    const newReason = msg.args.slice(2).join(' ');

    const proceed = checkWarn(msg, pNr);
    if (!proceed) return;

    const p = await getWarn(msg, pNr);
    if (!p) return;

    const user = await msg.client.users.fetch(p.userid).catch(() => {});

    editWarn(msg, p, newReason);
    declareSuccess(msg, p, user);
    doLog(msg, user, p, newReason);
  },
};

const getWarn = async (msg, pNr) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(
        `SELECT * FROM punish_${table} WHERE guildid = $1 AND uniquetimestamp = $2;`,
        [msg.guild.id, pNr],
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
    msg.client.ch.error(msg, msg.client.ch.stp(msg.lan.noWarn, { number: pNr }));
    return false;
  }

  const p = allWarns.find((w) => Number(w.uniquetimestamp) === pNr);

  return p;
};

const checkWarn = (msg, pNr) => {
  if (Number.isNaN(Number(pNr))) {
    msg.client.ch.error(
      msg,
      msg.client.ch.stp(msg.language.noNumber, { arg: msg.args[1] ? msg.args[1] : '-' }),
    );
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
    .setColor(msg.client.constants.commands.edit.success)
    .setFooter({ text: msg.lan.punishmentIssue });

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const doLog = (msg, user, p, reason) => {
  const logEmbed = new Builders.UnsafeEmbedBuilder();
  const con = msg.client.constants.commands.edit;

  logEmbed
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.punishmentOf, { target: user }),
      iconURL: con.log.image,
      url: msg.url,
    })
    .addFields(
      {
        name: msg.lan.oldReason,
        value: p.reason,
        inline: false,
      },
      {
        name: msg.lan.newReason,
        value: reason,
        inline: false,
      },
      {
        name: msg.lan.editedBy,
        value: `${msg.author}\n\`${msg.author.username}\` (\`${msg.author.id}\`)`,
        inline: false,
      },
    )
    .setColor(con.log.color)
    .setFooter({ text: `${msg.lan.punishmentID} ${Number(p.uniquetimestamp).toString(32)}` });

  if (msg.logchannels) {
    msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logEmbed] }));
  }
};

const editWarn = async (msg, p, newReason) => {
  await Promise.all(
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(
        `UPDATE punish_${table} SET reason = $4 WHERE guildid = $1 AND userid = $2 AND uniquetimestamp = $3;`,
        [msg.guild.id, p.userid, p.uniquetimestamp, newReason],
      ),
    ),
  );
};
