const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async exe(msg) {
		const members = [...msg.guild.members.cache.entries()];
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query(`SELECT * FROM roleseparator WHERE active = true AND guildid = '${msg.guild.id}';`);
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
							if (!member.roles.cache.has(role.id)) await member.roles.add(role).catch((e) => {console.log(e);});
						}
					}, (1500*roles[i==0?0:i-1].giveTheseRoles.length)+i*1000);
				}
			}
		}
	}
};