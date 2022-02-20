module.exports = {
  execute: async (msg) => {
    if (!msg.guild || msg.author.id === msg.client.user.id) return;

    const res = await msg.client.ch.query(
      `SELECT * FROM verification WHERE guildid = $1 AND startchannel = $2 AND deletestartchmsgs = true AND active = true;`,
      [msg.guild.id, msg.channel.id],
    );

    if (!res || !res.rowCount) return;

    msg.delete().catch(() => {});
  },
};
