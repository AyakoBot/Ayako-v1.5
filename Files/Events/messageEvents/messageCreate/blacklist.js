const regex = /\/[^ w]+\//g;
const Builders = require('@discordjs/builders');

const jobs = require('node-schedule');

module.exports = {
  async execute(msg) {
    if (!msg.channel) return;
    if (!msg.channel.type || msg.channel.type === 1) return;
    if (!msg.author || msg.author.bot) return;
    if (!msg.member) return;
    if (!msg.member.manageable) return;

    const result = await msg.client.ch.query(
      'SELECT * FROM blacklists WHERE guildid = $1 AND active = true;',
      [msg.guild.id],
    );

    if (!result || !result.rowCount) return;
    if (result.rows[0].bpchannelid?.includes(msg.channel.id)) return;
    if (result.rows[0].bpuserid?.includes(msg.author.id)) return;
    if (msg.member.roles.cache.some((r) => result.rows[0].bproleid?.includes(r.id))) return;
    if (!result.rows[0].words) return;

    const args = msg.content.split(/ +/);
    const words = [];

    const blwords = result.rows[0].words;
    for (let i = 0; i < args.length; i += 1) {
      const argr = `${args[i]}`.replace(regex, '');

      if (blwords.includes(argr.toLowerCase())) {
        if (`${blwords[i]}` !== '') words.push(argr.toLowerCase());
      }
    }

    if (!words.length) return;

    await msg.delete().catch(() => {});

    const language = await msg.client.ch.languageSelector(msg.guild);

    const m = await msg.client.ch.send(
      msg.channel,
      msg.client.ch.stp(language.commands.toxicityCheck.warning, { user: msg.author }),
    );

    if (m) {
      jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
        if (m) m.delete().catch(() => {});
      });
    }

    sendDm(msg, words, language);

    const amount = await getAmount(msg);

    if (
      result.rows[0].warntof === true &&
      amount === +result.rows[0].warnafter &&
      amount !== +result.rows[0].muteafter
    ) {
      msg.client.emit(
        'modBaseEvent',
        {
          executor: msg.client.user,
          target: msg.author,
          reason: language.commands.toxicityCheck.warnReason,
          msg,
          guild: msg.guild,
        },
        'warnAdd',
      );
      return;
    }

    if (
      result.rows[0].mutetof === true &&
      amount % +result.rows[0].muteafter === 0 &&
      amount !== +result.rows[0].kickafter
    ) {
      msg.client.emit(
        'modBaseEvent',
        {
          executor: msg.client.user,
          target: msg.author,
          reason: language.commands.toxicityCheck.warnReason,
          msg,
          guild: msg.guild,
          duration: 3600000,
        },
        'tempmuteAdd',
      );
      return;
    }

    if (
      result.rows[0].kicktof === true &&
      amount % +result.rows[0].kickafter === 0 &&
      amount !== +result.rows[0].banafter
    ) {
      msg.client.emit(
        'modBaseEvent',
        {
          executor: msg.client.user,
          target: msg.author,
          reason: language.commands.toxicityCheck.warnReason,
          msg,
          guild: msg.guild,
        },
        'kickAdd',
      );
      return;
    }

    if (result.rows[0].bantof === true && amount >= result.rows[0].banafter) {
      msg.client.emit(
        'modBaseEvent',
        {
          executor: msg.client.user,
          target: msg.author,
          reason: language.commands.toxicityCheck.warnReason,
          msg,
          guild: msg.guild,
        },
        'banAdd',
      );
    }
  },
};

const getAmount = async (msg) => {
  let amount;

  const res = await msg.client.ch.query(
    'SELECT * FROM toxicitycheck WHERE userid = $2 AND guildid = $1;',
    [msg.guild.id, msg.author.id],
  );
  if (res && res.rowCount > 0) {
    msg.client.ch.query(
      'UPDATE toxicitycheck SET amount = $2 WHERE userid = $3 AND guildid = $1;',
      [msg.guild.id, +res.rows[0].amount + 1, msg.author.id],
    );
    amount = +res.rows[0].amount;
  } else {
    msg.client.ch.query(
      'INSERT INTO toxicitycheck (guildid, userid, amount) VALUES ($1, $3, $2);',
      [msg.guild.id, 1, msg.author.id],
    );
    amount = 0;
  }
  amount += 1;

  return amount;
};

const sendDm = async (msg, words, language) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.client.constants.standard.image,
      iconURL: language.commands.toxicityCheck.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(
      msg.client.ch.stp(language.commands.toxicityCheck.info, { guild: msg.guild }) +
        words.map((w) => `\`${w}\``),
    )
    .setColor(msg.client.constants.commands.toxicityCheck);

  const DMchannel = await msg.author.createDM().catch(() => {});
  if (DMchannel) msg.client.ch.send(DMchannel, { embeds: [embed] });
};
