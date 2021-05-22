module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true;');
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const guild = client.guilds.cache.get(row.guildid);
				if (guild) {
					const separator = guild.roles.cache.get(row.separator);
					if (separator) {
						await guild.members.fetch();
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
							for (let i = 0; i < roles.length; i++) {
								const role = guild.roles.cache.get(roles[i]);
								console.log(role.id+' Checking a role');
								let members = role.members;
								members = members.map(o => o);
								for (let j = 0; j < members.length; j++) {
									console.log(role.id+' Checking if member gets role');
									if (!members[j].roles.cache.has(separator.id)) {
										setTimeout(async () => {
											console.log(members[j].user.id+' Adding Role to Member');
											await members[j].roles.add(separator).catch((e) => {console.log(e);});
											console.log(members[j].user.id+' Added Role to Member');
										}, j == 0 ? 0 : 3000*i);
									}
								}
								const nonRoleMembers = guild.members.cache.map(o => o).filter(m => !role.members.map(o => o).includes(m));
								for (let j = 0; j < nonRoleMembers.length; j++) {
									setTimeout(async () => {
										console.log(nonRoleMembers[j].user.id+' Removing Role from Member');
										await nonRoleMembers[j].roles.remove(separator).catch((e) => {console.log(e);});
										console.log(nonRoleMembers[j].user.id+' Removed Role from Member');
									}, j == 0 ? 0 : 3000*i);
								}
							}

						}
					} else ch.query(`UPDATE roleseparator SET active = false WHERE separator = '${row.separator}';`);
				}
			});
		}
	}
};