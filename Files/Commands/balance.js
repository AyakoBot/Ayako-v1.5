const Builders = require('@discordjs/builders');

module.exports = {
  name: 'balance',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['bal', '$'],
  type: 'currency',
  thisGuildOnly: ['298954459172700181'],
  execute: async (msg) => {
    let user = msg.args[0]
      ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {})
      : msg.author;
    if (!user) user = msg.author;

    const bal = await getBal(msg, user);
    msg.client.ch.reply(msg, {
      embeds: [
        new Builders.UnsafeEmbedBuilder()
          .setDescription(msg.client.ch.stp(msg.lan.has, { user, amount: bal }))
          .setColor(msg.client.ch.colorSelector(msg.guild.members.me)),
      ],
    });
  },
};

const getBal = async (msg, user) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM balance WHERE userid = $1 AND guildid = $2;`,
    [user.id, msg.guild.id],
  );
  if (!res || !res.rowCount) return String(0);
  return String(res.rows[0].balance);
};
