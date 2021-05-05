const ch = require('../../../BaseClient/ClientHelper');
const { client } = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute(rawmember, user) {
		const guild = rawmember.guild;
		let wasMuted = null;
		const res = await ch.query(`SELECT * FROM warns WHERE closed = 'false' AND type = 'Mute' AND guildid = '${guild.id}' AND userid = '${user.id}' AND closed = null;`);
		let Muterole;
		const member = await ch.member(guild, rawmember.user);
		if (res && res.rowCount > 0) {
			const resM = await ch.query(`SELECT * FROM muterole WHERE guildid = '${guild.id}';`);
			if (resM && resM > 0) {
				Muterole = guild.roles.cache.find(r => r.id == resM.rows[0].muteroleid);
			}
			if (!Muterole) Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			if (Muterole) {
				if (!member.roles.cache.has(Muterole.id)) { 
					const mres = await member.roles.add(Muterole).catch(() => {wasMuted = false;});
					if (mres) wasMuted = true;
				}
			}
		}
		const res2 = await ch.query(`SELECT * FROM warns WHERE closed = 'false' AND type = 'Mute' AND guildid = '${guild.id}' AND userid = '${user.id}' AND closed = false;`);
		if (res2 && res2.rowCount > 0) {
			const resM = await ch.query(`SELECT * FROM muterole WHERE guildid = '${guild.id}';`);
			if (resM && resM > 0) {
				Muterole = guild.roles.cache.find(r => r.id == resM.rows[0].muteroleid);
			} else {
				Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			}
			if (!Muterole) Muterole = guild.roles.cache.find(r => r.name.toLowerCase() == 'muted');
			if (Muterole) {
				if (!member.roles.cache.has(Muterole.id)) { 
					const mres = await member.roles.add(Muterole).catch(() => {wasMuted = false;});
					if (mres) wasMuted = true;
				}
			}
		}
		if (wasMuted !== null) {
			const language = await ch.languageSelector(guild);
			const lan = language.mod.mute;
			if (wasMuted == true) {
				client.emit('muteAdd', (client.user, user, guild, lan.activeMute));
			} else if (wasMuted == false) {
				client.emit('muteRemove', (client.user, user, guild, lan.activeMuteError));
			}
		}
	}
};