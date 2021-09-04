const Discord = require('discord.js');

module.exports = {
	async execute(oldRole, newRole) {
		const client = oldRole ? oldRole.client : newRole.client;
		if (oldRole.rawPosition !== newRole.rawPosition) return; // flawed logic
		const ch = client.ch;
		const Constants = client.constants;
		const regexes = {
			allow: new RegExp(Constants.enabled, 'g'),
			revoke: new RegExp(Constants.disabled, 'g'),
		};
		const guild = newRole.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.roleUpdate;
		const con = Constants.roleUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.roleEvents);
			if (logchannel && logchannel.id) {
				const embed  = new Discord.MessageEmbed()
					.setTimestamp()
					.setColor(con.color)
					.setAuthor(lan.author.name, con.author.image);
				const ChangedKey = [];
				if (oldRole.name !== newRole.name) {
					ChangedKey.push(language.name);
					embed.addField(language.name, `${language.before}: \`${oldRole.name}\`\n${language.after}: \`${newRole.name}\``);
				}
				if (oldRole.color !== newRole.color) {
					const oldColor = int2RGB2Hex(oldRole.color);
					const newColor = int2RGB2Hex(newRole.color);
					ChangedKey.push(language.color);
					embed.addField(language.color, `${language.before}: \`${oldColor}\`\n${language.after}: \`${newColor}\``);
				}
				if (oldRole.hoist !== newRole.hoist) {
					ChangedKey.push(language.hoisted);
					embed.addField(language.hoisted, `${language.before}: \`${oldRole.hoist}\`\n${language.after}: \`${newRole.hoist}\``);
				}
				if (oldRole.mentionable !== newRole.mentionable) {
					ChangedKey.push(language.mentionable);
					embed.addField(language.mentionable, `${language.before}: \`${oldRole.mentionable}\`\n${language.after}: \`${newRole.mentionable}\``);
				}
				if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
					ChangedKey.push(language.permissions.Permissions);
					const [oldRoleUniques, newRoleUniques] = ch.bitUniques(oldRole.permissions, newRole.permissions);
					const newMap = newRoleUniques.toArray();
					const oldMap = oldRoleUniques.toArray();
					let content = '';
					for (let i = 0; i < newMap.length; i++) {
						const map = newMap[i];
						if (!oldMap.includes(map)) {
							content += `${Constants.enabled} \`${language.permissions[map]}\`\n`;
						}
					}
					for (let i = 0; i < oldMap.length; i++) {
						const map = oldMap[i];
						if (!newMap.includes(map)) {
							content += `${Constants.disabled} \`${language.permissions[map]}\`\n`;
						}
					}
					if (content !== '') {
						if (content.length > 1024) content = content.replace(regexes.revoke, language.revoked);
						if (content.length > 1024) content = content.replace(regexes.allow, language.granted);
						embed.addField(language.permissions.updatedPermissions, content);
					}
				}
				const audits = await guild.fetchAuditLogs({limit: 3, type: 31});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter((a) => a.target.id == newRole.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				if (entry) embed.setDescription(ch.stp(lan.descriptionWithAudit, {user: entry.executor, role: newRole})+ChangedKey.map(o => ` \`${o}\``));
				else embed.setDescription(ch.stp(lan.descriptionWithoutAudit, {role: newRole})+ChangedKey.map(o => ` \`${o}\``));
				if (embed.fields.length > 0) ch.send(logchannel, embed);
			}
		} 
	}
};
      
function int2RGB2Hex(num) { // source of this function: https://github.com/curtisf/logger
	num >>>= 0;
	const b = num & 0xFF;
	const g = (num & 0xFF00) >>> 8;
	const r = (num & 0xFF0000) >>> 16;
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}