const { client } = require('../../../BaseClient/DiscordClient.js');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	async execute(member, user) {
		const ch = client.ch;
		const guild = member.guild;
		const res = await ch.query(`SELECT * FROM autorole WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			for (let i = 0; i < +res.rowCount; i++) {
				const r = res.rows[i];
				const role = guild.roles.cache.get(r.roleid);
				if (role) member.roles.add(role).catch(() => {});
			} 
		}   
	}
};