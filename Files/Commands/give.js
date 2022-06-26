const Builders = require('@discordjs/builders');

module.exports = {
  name: 'give',
  perm: null,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'currency',
  thisGuildOnly: ['298954459172700181'],
  execute: async (msg) => {
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const bal = await getBal(msg);
    const given = Number(msg.args[1]);
    if (given < 0 || Number.isNaN(+msg.args[1])) {
      msg.client.ch.error(msg, msg.lan.impossibleNumber);
      return;
    }

    if (given > bal) {
      msg.client.ch.error(msg, msg.lan.notEnough);
      return;
    }

    msg.client.ch.query(
      `INSERT INTO balance (userid, guildid, balance) VALUES ($1, $2, $3) ON CONFLICT (userid, guildid) DO UPDATE SET balance = balance.balance + $3;`,
      [user.id, msg.guild.id, given],
    );

    msg.client.ch.query(
      `UPDATE balance SET balance = balance.balance - $1 WHERE userid = $2 AND guildid = $3;`,
      [given, msg.author.id, msg.guild.id],
    );

    msg.client.ch.reply(msg, {
      embeds: [
        new Builders.UnsafeEmbedBuilder()
          .setDescription(msg.client.ch.stp(msg.lan.sent, { user, amount: String(given) }))
          .setColor(msg.client.ch.colorSelector(msg.guild.members.me)),
      ],
    });
  },
};

const getBal = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM balance WHERE userid = $1 AND guildid = $2;`,
    [msg.author.id, msg.guild.id],
  );
  if (!res || !res.rowCount) return 0;
  return Number(res.rows[0].balance);
};
