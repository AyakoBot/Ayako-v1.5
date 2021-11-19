module.exports = {
	async execute(oldState, newState) {
		if (!oldState || !newState) return;
		if (oldState.channel !== newState.channel) {
			const user = newState.member.user;
			const guild = newState.guild;
			const client = newState.guild.client;
			const mute = client.mutes.get(`${guild.id}-${user.id}`);
			if (mute) {
				const language = await client.ch.languageSelector(guild.id);
				const lan = language.commands.tempmute;
				newState.setMute(true, lan.vcReason).catch(() => { });
			} else if (!newState.serverMute) {
				const res = await client.ch.query('SELECT * FROM warns WHERE userid = $1 AND guildid = $2 AND closed = false;', [user.id, guild.id]);
				const language = await client.ch.languageSelector(guild.id);
				if (res && res.rowCount > 0 && newState.serverMute) {
					const lan = language.commands.tempmute;
					newState.setMute(true, lan.vcReason).catch(() => { });
				} else {
					const res2 = await client.ch.query('SELECT * FROM warns WHERE userid = $1 AND guildid = $2 AND closed = true;', [user.id, guild.id]);
					if (res2 && res2.rowCount > 0 && !newState.serverMute) {
						const lan = language.commands.unmute;
						newState.setMute(false, lan.vcReason).catch(() => { });
					} else {
						const res3 = await client.ch.query('SELECT * FROM warns WHERE userid = $1 AND guildid = $2 AND closed IS NULL;', [user.id, guild.id]);
						if (res3 && res3.rowCount > 0 && newState.serverMute) {
							const lan = language.commands.mute;
							newState.setMute(true, lan.vcReason).catch(() => { });
						}
					}
				}
			}
		}
	}
};