module.exports = {
  async execute(reaction, user) {
    const { client } = reaction;
    if (user.id === client.user.id) return;
    const { ch } = client;
    const { guild } = reaction.message;
    const isUnicode = ch.containsNonLatinCodepoints(reaction.emoji.name);
    const res = await ch.query('SELECT * FROM reactionroles WHERE msgid = $1 AND emoteid = $2;', [
      reaction.message.id,
      isUnicode ? reaction.emoji.name : reaction.emoji.id,
    ]);
    if (res && res.rowCount > 0) {
      res.rows.forEach(async (row) => {
        const member = await guild.members.fetch(user.id);
        if (member) {
          const role = guild.roles.cache.get(row.roleid);
          if (member.roles.cache.has(row.roleid)) member.roles.remove(role).catch(() => {});
        }
      });
    }
  },
};
