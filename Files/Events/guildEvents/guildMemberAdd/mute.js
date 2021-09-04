module.exports = {
	async execute(rawmember, user) {
		const client = user.client;
		const guild = rawmember.guild;
		const ch = client.ch;
		let wasMuted = null;
		const res = await ch.query('SELECT * FROM warns WHERE closed = $1 AND type = $2 AND guildid = $3 AND userid = $4 AND closed = $5;', [false, 'Mute', guild.id, user.id, null]);
		let Muterole;
		const member = await guild.members.fetch(rawmember.id);
		if (res && res.rowCount > 0) {
			const resM = await ch.query('SELECT * FROM muterole WHERE guildid = $1;', [guild.id]);
			if (resM && resM > 0) {
				Muterole = guild.roles.cache.find(r => r.id == resM.rows[0].muteroleid);
			}
			if (!Muterole) Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			if (Muterole) {
				if (!member.roles.cache.has(Muterole.id)) { 
					const mres = await member.roles.add(Muterole).catch(() => {});
					if (mres) wasMuted = true;
				} else wasMuted = false;
			}
		}
		const res2 = await ch.query('SELECT * FROM warns WHERE closed = $1 AND type = $2 AND guildid = $3 AND userid = $4 AND closed = $5;', [false, 'Mute', guild.id, user.id, false]);
		if (res2 && res2.rowCount > 0) {
			const resM = await ch.query('SELECT * FROM muterole WHERE guildid = $1;', [guild.id]);
			if (resM && resM > 0) {
				Muterole = guild.roles.cache.find(r => r.id == resM.rows[0].muteroleid);
			} else {
				Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			}
			if (!Muterole) Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			if (Muterole) {
				if (!member.roles.cache.has(Muterole.id)) { 
					const mres = await member.roles.add(Muterole).catch(() => {});
					if (mres) wasMuted = true;
				} else wasMuted = false;
			}
		}
		if (wasMuted !== null) {
			const language = await ch.languageSelector(guild);
			const lan = language.mod.muteAdd;
			if (wasMuted == true) client.emit('modMuteAdd', (client.user, user, lan.activeMute, member));
			else if (wasMuted == false) client.emit('modMuteRemove', (client.user, user, lan.activeMuteError, member));
		}
	}
};