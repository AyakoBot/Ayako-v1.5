const ms = require('ms');	

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
	},
	async oneTimeRunner(msg) {
		const members = [...msg.guild.members.cache.entries()];
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query(`SELECT * FROM roleseparator WHERE active = true AND guildid = '${msg.guild.id}';`);
		const r = res.rows[0];
		if (r.lastrun+ms('7d') > Date.now()) return false;
		msg.client.ch.query(`UPDATE roleseparator SET lastrun = '${Date.now()}' WHERE guildid = '${msg.guild.id}';`);
		await msg.guild.members.fetch();
		const roles = [];
		for (let i = 0; members.length > i; i++) {
			const memberr = members[i];
			const member = memberr[1];
			if (res && res.rowCount > 0) {
				const roleArr = [];
				res.rows.forEach(async (row) => {
					const guild = client.guilds.cache.get(row.guildid);
					if (guild) {
						const separator = guild.roles.cache.get(row.separator);
						if (separator) {
							const stopRole = guild.roles.cache.get(row.stoprole);
							if (stopRole) member.roles.cache.forEach((role) => stopRole.rawPosition > separator.rawPosition && role.rawPosition > separator.rawPosition && role.rawPosition < stopRole.rawPosition ? roleArr.push(separator, stopRole) :  stopRole.rawPosition < separator.rawPosition && role.rawPosition < separator.rawPosition && role.rawPosition > stopRole.rawPosition ? roleArr.push(separator, stopRole) : '');
							else member.roles.cache.forEach((role) => role.rawPosition > separator.rawPosition ? roleArr.push(separator) : '');
						} else ch.query(`UPDATE roleseparator SET active = false WHERE separator = '${row.separator}';`);
					}
				});
				const uniques = [...new Set(roleArr)];
				if (roleArr.length > 0) {
					member.giveTheseRoles = uniques;
					roles.push(member);
				}
			}
		}
		if (roles.length > 0) {
			for (let i = 0; i < roles.length; i++) {
				const member = roles[i];
				if (member.giveTheseRoles) {
					setTimeout(async  () => {
						for (let i = 0; i < member.giveTheseRoles.length; i++) {
							const role = member.giveTheseRoles[i];
							if (!member.roles.cache.has(role.id)) await member.roles.add(role).catch(() => {});
						}
					}, (1500*roles[i==0?0:i-1].giveTheseRoles.length)+i*1500);
				}
			}
		}
		return roles;
	}
};