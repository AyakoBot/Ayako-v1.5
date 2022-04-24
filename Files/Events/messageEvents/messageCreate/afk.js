const moment = require('moment');
require('moment-duration-format');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(msg) {
    if (!msg.author) return;
    if (msg.author.bot) return;
    if (!msg.guild) return;

    let checkedMsg = await require('./commandHandler').prefix(msg);

    if (checkedMsg) [checkedMsg] = checkedMsg;

    const language = await msg.client.ch.languageSelector(msg.guild);

    doSelfAFKCheck(msg, checkedMsg, language);
    doMentionAFKcheck(msg, checkedMsg, language);
  },
};

const doSelfAFKCheck = async (msg, checkedMsg, language) => {
  if (checkedMsg?.command.name === 'afk') return;

  const afkRow = await getAfkRow(msg);
  if (!afkRow) return;
  const isOldEnoug = Number(afkRow.since) + 60000 < Date.now();

  if (!isOldEnoug) return;

  const embed = getAFKdeletedEmbed(msg, language, afkRow);
  const m = await msg.client.ch.reply(msg, { embeds: [embed], noCommand: true });

  handleReactions(m, msg);
  deleteM(m);
  deleteAfk(msg);
  deleteNickname(msg, language);
};

const doMentionAFKcheck = (msg, checkedMsg, language) => {
  if (checkedMsg?.command.name === 'unafk') return;

  msg.mentions.users
    .map((o) => o)
    .forEach(async (mention) => {
      const afkRow = await getAfkRow(msg, mention);
      if (!afkRow) return;

      const embed = getIsAFKEmbed(msg, language, mention, afkRow);
      msg.client.ch.reply(msg, { embeds: [embed], noCommand: true });
    });
};

const getIsAFKEmbed = (msg, language, mention, afkRow) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(msg.client.ch.colorSelector(msg.guild.me))
    .setFooter({
      text: msg.client.ch.stp(language.commands.afk.footer, {
        user: mention,
        time: getTime(afkRow, language),
      }),
    });

  if (afkRow.text) {
    embed.setDescription(afkRow.text);
  }

  return embed;
};

const getAfkRow = async (msg, mention) => {
  const afkRes = await msg.client.ch.query(
    'SELECT * FROM afk WHERE userid = $1 AND guildid = $2;',
    [mention ? mention.id : msg.author.id, msg.guild.id],
  );

  if (afkRes && afkRes.rowCount) return afkRes.rows[0];
  return null;
};

const getTime = (afkRow, language) =>
  moment
    .duration(Number(afkRow.since) - Date.now())
    .format(
      ` D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
    )
    .replace(/-/g, '');

const deleteNickname = (msg, language) => {
  if (!msg.member.nickname || !msg.member.nickname.endsWith(' [AFK]')) return;
  const newNickname = msg.member.displayName.slice(0, msg.member.displayName.length - 6);
  if (!msg.guild.me.permissions.has(134217728n) || !msg.member.manageable) return;
  msg.member.setNickname(newNickname, language.commands.afkHandler.delAfk).catch(() => {});
};

const deleteAfk = (msg) => {
  msg.client.ch.query('DELETE FROM afk WHERE userid = $1 AND guildid = $2;', [
    msg.author.id,
    msg.guild.id,
  ]);
};

const deleteM = (m) => {
  if (m && !m.embeds.length > 1) {
    jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
      m.delete().catch(() => {});
    });
  }
};

const getAFKdeletedEmbed = (msg, language, afkRow) =>
  new Builders.UnsafeEmbedBuilder().setColor(msg.client.ch.colorSelector(msg.guild.me)).setFooter({
    text: msg.client.ch.stp(language.commands.afkHandler.footer, {
      time: getTime(afkRow, language),
    }),
  });

const handleReactions = async (m, msg) => {
  if (!m) return;

  const reaction = await m.react(m.client.objectEmotes.cross).catch(() => {});
  if (!reaction) return;

  const reactionsCollector = m.createReactionCollector({ time: 20000 });

  reactionsCollector.on('end', (collected, reason) => {
    if (reason === 'time') reaction.users.remove(m.client.user.id).catch(() => {});
  });

  reactionsCollector.on('collect', (r, user) => {
    if (user.id !== msg.author.id) return;

    m.delete().catch(() => {});
  });
};
