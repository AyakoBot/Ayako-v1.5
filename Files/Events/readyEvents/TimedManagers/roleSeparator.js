module.exports = {
	async execute() {
		const { client } = require('../../../BaseClient/DiscordClient');
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
									if (stopRole.rawPosition > separator.rawPosition) if (r.rawPosition < stopRole.rawPosition && r.rawPosition > separator.rawPosition) roles.push(r);
									else if (stopRole.rawPosition < separator.rawPosition) if (r.rawPosition > stopRole.rawPosition && r.rawPosition < separator.rawPosition) roles.push(r);
								});
							} else ch.query(`UPDATE roleseparator SET active = false WHERE stoprole = '${row.stoprole}';`);
						} else guild.roles.cache.forEach(r => {if (r.rawPosition > separator.rawPosition) roles.push(r);});
						if (roles[0]) {
							for (const r of [...roles.entries()]) {
								r[1].members.forEach(m => {if (!m.roles.cache.has(separator.id)) m.roles.add(separator).catch(() => {});});
							}
						}
					} else ch.query(`UPDATE roleseparator SET active = false WHERE separator = '${row.separator}';`);
				}
			});
		}
	}
};