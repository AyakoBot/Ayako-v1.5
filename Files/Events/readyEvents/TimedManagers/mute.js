const { client } = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute() {
		const ch = client.ch;
		client.guilds.cache.forEach(async guild => {
			const res = await ch.query(`SELECT * FROM warns WHERE type = 'Mute' AND guildid = '${guild.id}';`);
			if (res && res.rowCount > 0) {
				for (let i = 0; i < res.rowCount; i++) {
					const r = res.rows[i];
					if (r.closed == false) {
						const user = await client.users.fetch(r.userid);
						const end = r.duration;
						if (end < Date.now()) {
							let muteroleid;
							let muterole;
							if (guild && guild.id) {
								const res = await ch.query(`SELECT muteroleid FROM muterole WHERE guildid = '${guild.id}';`);
								if (res && res.rowCount > 0) {
									muteroleid = res.rows[0].muteroleid;
									muterole = guild.roles.cache.find(r => r.id === muteroleid);
								} else muterole = guild.roles.cache.find(role => role.name === 'Muted');
								if (guild && guild.id) {
									if (user && user.id) {
										const member = await ch.member(guild, user.id);
										if (member) {
											const language = await ch.languageSelector(guild);
											if (member.roles.cache.has(muterole.id)) {
												await member.roles.remove(muterole).catch(() => {});
												client.emit('muteRemove', client.user, user, guild, language.ready.unmute.reason);
												closed(guild, user, end);
											} else closed(guild, user, end);
										} else closed(guild, user, end);
									}
								}
							}
						}
					}
				}
			}
		});
	}
};

function closed(guild, user, end) {
	client.ch.query(`UPDATE warns SET closed = 'true' WHERE guildid = '${guild.id}' AND userid = '${user.id}' AND type = 'Mute' AND duration = '${end}';`);
}