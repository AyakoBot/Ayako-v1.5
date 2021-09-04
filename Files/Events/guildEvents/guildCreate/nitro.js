module.exports = {
	async execute(guild) {
		const res = await guild.client.ch.query('SELECT * FROM nitrosettings WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0 && guild.roles.cache.get(res.rows[0].boosterroleid).tags?.premiumSubscriberRole) return; 
		let role;
		const roles = guild.roles.cache.map(o => o);
		for (const Role of roles) {
			if (role && role.id) {
				if (!res || res.rowCount == 0) guild.client.ch.query('INSERT INTO nitrosettings (guildid, boosterroleid) VALUES ($2, $1);', [role.id, guild.id]);
				else {
					if (res && res.rowCount > 0 && guild.roles.cache.get(res.rows[0].boosterroleid).tags?.premiumSubscriberRole) return; 
					guild.client.ch.query('UPDATE nitrosettings SET boosterroleid = $1 WHERE guildid = $2;', [role.id, guild.id]);
					return;
				}
			}
			if (Role && Role.tags?.premiumSubscriberRole) role = Role;
		}
	}
};