module.exports = {
	async execute(guild) {
		const client = guild.client;
		const ch = client.ch;
		const res = await ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) ch.query(`UPDATE antispamsettings SET forceDisabled = true WHERE guildid = '${guild.id}';`);
	}
};