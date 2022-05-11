module.exports = {
  name: 'disableprivacyandtermsreminder',
  perm: 8n,
  dm: false,
  takesFirstArg: false,
  aliases: null,
  type: 'other',
  execute: async (msg) => {
    const res = await msg.client.ch.query(`SELECT * FROM policy_guilds WHERE guildid = $1;`, [
      msg.guild.id,
    ]);

    if (!res || !res.rowCount) {
      await msg.client.ch.query(`INSERT INTO policy_guilds (guildid) VALUES ($1);`, [msg.guild.id]);
      msg.react(msg.client.objectEmotes.tick).catch(() => {});
      msg.client.ch.reply(msg, {
        content:
          msg.lan.disabled,
      });
      return;
    }

    await msg.client.ch.query(`DELETE FROM policy_guilds WHERE guildid = $1;`, [msg.guild.id]);
    msg.react(msg.client.objectEmotes.tick).catch(() => {});
    msg.client.ch.reply(msg, { content: msg.lan.reenabled });
  },
};
