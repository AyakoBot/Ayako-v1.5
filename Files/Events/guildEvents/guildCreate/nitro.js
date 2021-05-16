module.exports = {
	async execute(guild) {
		const res = await guild.client.ch.query(`SELECT * FROM nitrosettings WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0 && guild.roles.cache.get(res.rows[0].boosterroleid).tags?.premiumSubscriberRole) return; 
		let role;
		const roles = guild.roles.cache.map(o => o);
		for (const Role of roles) {
			if (role && role.id) {
				if (!res || res.rowCount == 0) guild.client.ch.query(`INSERT INTO nitrosettings (guildid, boosterroleid) VALUES ('${guild.id}', '${role.id}');`);
				else {
					if (res && res.rowCount > 0 && guild.roles.cache.get(res.rows[0].boosterroleid).tags?.premiumSubscriberRole) return; 
					guild.client.ch.query(`UPDATE nitrosettings SET boosterroleid = '${role.id}' WHERE guildid = '${guild.id}';`);
					return;
				}
				if (Role && Role.tags?.premiumSubscriberRole) role = Role;
			}
		}
	}
};