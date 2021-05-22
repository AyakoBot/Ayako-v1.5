module.exports = {
	async execute(oldMember, newMember) {
		const client = oldMember ? oldMember.client : newMember.client;
		const ch = client.ch;
		const guild = oldMember ? oldMember.guild : newMember.guild;
		const member = newMember ? newMember : ch.member(guild, oldMember.user);
		const res = await ch.query(`SELECT * FROM roleseparator WHERE active = true AND guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const guild = client.guilds.cache.get(row.guildid);
				if (guild) {
					const separator = guild.roles.cache.get(row.separator);
					if (separator) {
						const roles = [];
						if (row.stoprole) {
							const stopRole = guild.roles.cache.get(row.stoprole);
							if (stopRole) {
								guild.roles.cache.forEach(r => {
									if (stopRole.rawPosition > separator.rawPosition) if (r.rawPosition < stopRole.rawPosition && r.rawPosition > separator.rawPosition) roles.push(r.id);
									else if (stopRole.rawPosition < separator.rawPosition) if (r.rawPosition > stopRole.rawPosition && r.rawPosition < separator.rawPosition) roles.push(r.id);
								});
							} else ch.query(`UPDATE roleseparator SET active = false WHERE stoprole = '${row.stoprole}';`);
						} else guild.roles.cache.forEach(r => {if (r.rawPosition > separator.rawPosition) roles.push(r.id);});
						if (roles[0]) {
							let aknowledgedSeperator = false;
							for (let i = 0; i < roles.length; i++) {
								const role = guild.roles.cache.get(roles[i]);
								if (member.roles.cache.has(role.id)) {
									aknowledgedSeperator = true;
									if (!member.roles.cache.has(separator.id)) await member.roles.add(separator).catch((e) => {console.log(e);});
								}
							}
							if (aknowledgedSeperator == false && member.roles.cache.has(separator.id)) await member.roles.remove(separator).catch((e) => {console.log(e);});
						}
					} else ch.query(`UPDATE roleseparator SET active = false WHERE separator = '${row.separator}';`);
				}
			});
		}
	} 
};