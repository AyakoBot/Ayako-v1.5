const ch = require('../../../BaseClient/ClientHelper');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	async execute(member, user) {
		const guild = member.guild;
		const res = await ch.query(`SELECT * FROM autorole WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			for (let i = 0; i < +res.rowCount; i++) {
				const r = res.rows[i];
				const role = guild.roles.cache.get(r.roleid);
				member.roles.add(role).catch(() => {});
			} 
		}   
	}
};