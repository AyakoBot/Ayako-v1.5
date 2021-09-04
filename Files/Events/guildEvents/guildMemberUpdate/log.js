const Discord = require('discord.js');

module.exports = {
	async execute(oldMember, newMember) {
		const client = oldMember ?  oldMember.client : newMember.client;
		const ch = client.ch;
		const Constants = client.constants;
		const member = await newMember.fetch();
		const user = await client.users.fetch(member.user.id);
		const guild = member.guild;
		const language = await ch.languageSelector(guild);
		const con = Constants.guildMemberUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.setColor(con.color);
				if (oldMember && member.nickname !== oldMember.nickname) {
					const lan = language.guildMemberUpdateNickname;
					embed.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {user: user}));
					const audit = await guild.fetchAuditLogs({limit: 5, type: 24});
					let entry;
					if (audit && audit.entries) {
						entry = audit.entries.filter((e) => e.target.id == user.id);
						entry = entry.sort((a,b) => b.id - a.id);
						entry = entry.first();
					}
					if (entry) {
						if (entry.executor.id == user.id) {
							embed.setDescription(ch.stp(lan.descriptionNoUser, {user: entry.executor}));
						} else {
							embed.setDescription(ch.stp(lan.descriptionUser, {user: entry.executor, target: entry.target}));
						}
					} else {
						embed.setDescription(ch.stp(lan.descriptionNoAudit, {user: user}));
					}
					embed.addField(language.nickname, `${language.before}: \`${oldMember.nickname ? oldMember.nickname : user.username}\`\n${language.after}: \`${member.nickname ? member.nickname : user.username}\``);
					ch.send(logchannel, embed);
					return;
				} else if (oldMember && (oldMember.pending && !member.pending && guild.features.includes('COMMUNITY'))) {
					const lan = language.guildMemberUpdateVerify;
					embed.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {user: user}));
					embed.setDescription(ch.stp(lan.description, {user: user}));
					ch.send(logchannel, embed);
					return;
				}
				if (oldMember.roles.cache == newMember.roles.cache) return;
				const audit = await guild.fetchAuditLogs({limit: 10, type: 25}).catch(() => {});
				let entry;
				if (audit && audit.entries) {
					entry = audit.entries.filter(e => e.target.id === user.id);
					entry = entry.first();
				}
				if (entry) {
					if (Date.now() - ((entry.id / 4194304) + 1420070400000) < 3000) {
						const added = [];
						const removed = [];
						if (entry.changes) {
							for (let i = 0; i < entry.changes.length; i++) {
								if (entry.changes[i].key == '$add') entry.changes[i].new.forEach(r => added.push(r));
								if (entry.changes[i].key == '$remove') entry.changes[i].new.forEach(r => removed.push(r));
							}
						}
						const lan = language.guildMemberUpdateRoles;
						if (entry.executor.id == entry.target.id) embed.setDescription(ch.stp(lan.descriptionNoUser, {user: entry.executor}));
						else embed.setDescription(ch.stp(lan.descriptionUser, {user: entry.executor, target: entry.target}));
						embed.addField(language.changes, `${added.map(role => `<:Add:834262756013113354>  <@&${role.id}>`).join('\n')}\n${removed.map((role, i) => `${i === 0 && added.length !== 0 ? '\n' : ''}\n<:Remove:834262790180306964>  <@&${role.id}>`).join('\n')}`);
						embed.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {user: user}));
						ch.send(logchannel, embed);
					}
				}
			}
		}
	}
};