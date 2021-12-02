module.exports = {
  async execute(guild) {
    const { client } = guild;
    const { ch } = client;
    const res = await ch.query('SELECT * FROM antispamsettings WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0)
      ch.query('UPDATE antispamsettings SET forceDisabled = true WHERE guildid = $1;', [guild.id]);
  },
};
