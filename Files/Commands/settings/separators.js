const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	async exe(msg) {
		let res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		const roleCheck = await checker(msg, res);
		if (roleCheck) res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		res.rows.sort((a, b) => {msg.guild.roles.cache.get(a.separator).rawPosition -  msg.guild.roles.cache.get(b.separator).rawPosition;});
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.list) return this.list(msg, res);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) return this.edit(msg);
		else {
			const embed = new Discord.MessageEmbed()
				.setDescription(msg.client.ch.stp(msg.lan.list.name, {prefix: msg.client.constants.standard.prefix}))
				.setColor(msg.client.constants.commands.settings.color)
				.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
			if (res && res.rowCount > 0) {
				for (let i = 0; i < res.rowCount; i++) {
					const r = res.rows[i];
					embed.addField(msg.language.number+` \`${i}\``, `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.lan.stoprole}:${r.stoprole ? `<@&${r.stoprole}>` : msg.language.none}\n${msg.lan.separator}:${r.separator ? `<@&${r.separator}>` : msg.language.none}`);
				}
			}
			if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix})+'\n\n'+msg.client.ch.stp(msg.lan.list.name, {prefix: msg.client.constants.standard.prefix}));
			msg.m ? msg.m.edit(embed) : msg.client.ch.reply(msg, embed);
			const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 30000});
			if (!collected || !collected.first()) return;
			else {
				const answer = collected.first().content.toLowerCase();
				if (answer.includes(msg.language.list)) return this.list(msg, res, answer);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm)) && answer == msg.language.edit) this.edit(msg);
			}
		}
	},
	async edit(msg) {
		msg.lan2 = msg.lan.edit;
		const res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		const embed = new Discord.MessageEmbed()
			.setDescription('__'+msg.lan2.howToEdit+'__\n\n'+msg.client.ch.stp(msg.lan2.remove.name, {trigger: msg.lan.edit.remove.trigger.map(e => `\`${e}\``), amount: '-'})+'\n'+msg.client.ch.stp(msg.lan2.add.name, {trigger: msg.lan.edit.add.trigger.map(e => `\`${e}\``), amount: '-'})+'\n'+msg.client.ch.stp(msg.lan2.edit.name, {trigger: msg.lan.edit.edit.trigger.map(e => `\`${e}\``), amount: '-'}))
			.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setFooter(msg.lan2.howToEdit);
		const m = await msg.client.ch.reply(msg, embed);
		let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
		if (!collected.first()) return;
		const editAnswers = {}; 
		let answer = collected.first().content.toLowerCase();
		for (let i = 0; i < Object.keys(msg.lan.edit).length; i++) {
			const name = Object.getOwnPropertyNames(msg.lan.edit);
			if (name[i] !== 'author' && name[i] !== 'howToEdit') {
				editAnswers[name[i]] = msg.lan.edit[name[i]].trigger;
				for (let j = 0; j < Object.keys(editAnswers[name[i]]).length; j++) {editAnswers[name[i]][j] = editAnswers[name[i]][j].replace(/`/g, '');}
			}
		}
		for (let i = 0; i < Object.keys(editAnswers).length; i++) {
			const name = Object.getOwnPropertyNames(editAnswers);
			if (editAnswers[name[i]].includes(answer)) {
				collected.first().delete().catch(() => {});
				const editEmbed = new Discord.MessageEmbed()
					.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
					.addField(msg.language.commands.settings.valid, msg.lan2[name[i]].answers);
				if (msg.lan2[name[i]].recommended) editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan.edit[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**\n\n'+msg.lan2[name[i]].recommended);
				else editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan2[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**');
				m.edit(editEmbed).catch(() => {});
				collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
				if (!collected.first()) return;
				answer = collected.first().content.toLowerCase();
				if (msg.client.constants.commands.settings.edit.separators[name[i]] == 'mention' && name[i] == 'add') {
					collected.first().delete().catch(() => {});
					const sep = msg.guild.roles.cache.get(answer.replace(/\D+/g, ''));
					let content; let stopRole;
					if (!sep) content = msg.lan2[name[i]].fail.no;
					else {
						content = msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading});
						const stopEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.lan2[name[i]].stopRole.question)
							.addField(msg.language.commands.settings.valid, msg.lan2[name[i]].stopRole.answers);
						m.edit(stopEmbed).catch(() => {});
						let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
						if (!collected.first()) return;
						answer = collected.first().content.toLowerCase();
						collected.first().delete().catch(() => {});
						if (answer !== msg.language.no) {
							stopRole = msg.guild.roles.cache.get(answer.replace(/\D+/g, ''));
							if (!stopRole) content = msg.lan2[name[i]].fail.no;
							else msg.client.ch.query(`INSERT INTO roleseparator (guildid, separator, active, stoprole) VALUES ('${msg.guild.id}', '${sep.id}', true, '${stopRole.id}');`);
						} else msg.client.ch.query(`INSERT INTO roleseparator (guildid, separator, active) VALUES ('${msg.guild.id}', '${sep.id}', true);`);
					}
					collected.first().delete().catch(() => {});
					const endEmbed = new Discord.MessageEmbed()
						.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
						.setDescription(content)	
						.addField(msg.lan.newValue, `${msg.lan.separator}: ${sep}\n${stopRole ? `${msg.lan.stoprole}: ${stopRole}` : ''}`);							
					m.edit(endEmbed).catch(() => {});
					const index = msg.args.indexOf(msg.language.edit);
					msg.args.splice(index, 1);
					msg.m = m;
					setTimeout(() => {this.exe(msg);}, 5000);
				} else if (msg.client.constants.commands.settings.edit.separators[name[i]] == 'number') {
					collected.first().delete().catch(() => {});
					if (name[i] == 'remove') {
						const r = res.rows[answer];
						if (r && !isNaN(answer)) {
							msg.client.ch.query(`DELETE FROM roleseparator WHERE guildid = '${msg.guild.id}' AND separator = '${r.separator}';`);
							collected.first().delete().catch(() => {});
							const endEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}))
								.addField(msg.lan.deleted, `\`${r.separator}\` / ${msg.guild.roles.cache.get(r.separator)}\n${msg.language.number}: ${answer}`);
							m.edit(endEmbed).catch(() => {});
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							msg.m = m;
							setTimeout(() => {this.exe(msg);}, 5000);
						} else return this.notValid(msg, m, name[i]);
					} else if (name[i] == 'edit') {
						const r = res.rows[answer];
						if (r && !isNaN(answer)) {
							const newembed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.lan2.edit.question+'\n\n'+msg.client.ch.stp(msg.lan2.edit.editing, {role: msg.guild.roles.cache.get(r.separator), nr: answer}))
								.addFields(
									{name: msg.client.ch.stp(msg.lan2.active.name, {trigger: msg.lan2.active.trigger.includes('`') ? msg.lan2.active.trigger : msg.lan2.active.trigger.map(f => `\`${f}\``)}), value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled},
									{name: msg.client.ch.stp(msg.lan2.stoprole.name, {trigger: msg.lan2.stoprole.trigger.includes('`') ? msg.lan2.stoprole.trigger : msg.lan2.stoprole.trigger.map(f => `\`${f}\``)}), value: r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : msg.language.none}
								);
							m.edit(newembed).catch(() => {});
							let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
							if (!collected.first()) return;
							answer = collected.first().content.toLowerCase();
							const editeditAnswers = {}; 
							for (let i = 0; i < Object.keys(msg.lan.edit).length; i++) {
								const newName = Object.getOwnPropertyNames(msg.lan.edit);
								if (newName[i] !== 'author' && newName[i] !== 'howToEdit') {
									editeditAnswers[newName[i]] = msg.lan.edit[newName[i]].trigger;
									for (let j = 0; j < Object.keys(editeditAnswers[newName[i]]).length; j++) {editeditAnswers[newName[i]][j] = editeditAnswers[newName[i]][j].replace(/`/g, '');}
								}
							}
							for (let i = 0; i < Object.keys(editeditAnswers).length; i++) {
								const newName = Object.getOwnPropertyNames(editeditAnswers);
								if (editAnswers[name[i]].includes(answer)) {
									collected.first().delete().catch(() => {});
									const editEmbed = new Discord.MessageEmbed()
										.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
										.addField(msg.language.commands.settings.valid, msg.lan2[name[i]].answers);
									if (msg.lan2[name[i]].recommended) editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan.edit[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**\n\n'+msg.lan2[name[i]].recommended);
									else editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan2[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**');
									m.edit(editEmbed).catch(() => {});
									collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
									if (!collected.first()) return;
									answer = collected.first().content.toLowerCase();
									if (msg.client.constants.commands.settings.edit.separators[newName[i]] == 'boolean') {
										const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
										collected.first().delete().catch(() => {});
										if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
										else {
											msg.client.ch.query(`UPDATE roleseparator SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}' AND separator = '${r.separator}';`);
											const endEmbed = new Discord.MessageEmbed()
												.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
												.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}))
												.addField(msg.lan.oldValue, r[name[i]])
												.addField(msg.lan.newValue, answer);						
											m.edit(endEmbed).catch(() => {});
											const index = msg.args.indexOf(msg.language.edit);
											msg.args.splice(index, 1);
											msg.m = m;
											setTimeout(() => {this.exe(msg);}, 5000);
										}
									} else if (msg.client.constants.commands.settings.edit.separators[newName[i]] == 'mention' && newName[i] == 'stoprole') {
										const newRole = msg.guild.roles.cache.get(answer.replace(/\D+/g, ''));
										let content;
										if (!newRole) content = msg.lan2[name[i]].fail.no;
										else {
											content = msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading});
											msg.client.ch.query(`UPDATE roleseparator SET ${name[i]} = ${newRole.id} WHERE guildid = '${msg.guild.id}' AND separator = '${r.separator}';`);
										}
										collected.first().delete().catch(() => {});
										const endEmbed = new Discord.MessageEmbed()
											.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
											.setDescription(content)
											.addField(msg.lan.oldValue, r[name[i]])
											.addField(msg.lan.newValue, answer);						
										m.edit(endEmbed).catch(() => {});
										const index = msg.args.indexOf(msg.language.edit);
										msg.args.splice(index, 1);
										msg.m = m;
										setTimeout(() => {this.exe(msg);}, 5000);
									}
								}
							}	
						} else return this.notValid(msg, m, name[i]);
					} else this.notValid(msg, m, name[i]);
				}
			} 
		}
	},
	async notValid(msg, m, name) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.edit.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.notValid)
			.addField(msg.language.commands.settings.valid, msg.lan2[name].answers)
			.setFooter(msg.lan.pleaseRestart);
		msg.client.ch.reply(m, embed);
	},
	async list(msg, res, answer) {
		msg.lan2 = msg.lan.list; let nr;
		answer ? nr = answer.split(/ +/)[1] : nr = msg.args[2];
		const embed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.commands.settings.color)
			.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				if (i == nr) {
					const r = res.rows[i];
					const stopRole = msg.guild.roles.cache.get(r.stoprole);
					const separator = msg.guild.roles.cache.get(r.separator);
					const roles = [];
					if (stopRole) msg.guild.roles.cache.forEach((role) => {stopRole.rawPosition > separator.rawPosition && (separator.rawPosition < role.rawPosition && stopRole.rawPosition > role.rawPosition) ? roles.push(role) : separator.rawPosition > stopRole.rawPosition && (separator.rawPosition > role.rawPosition && stopRole.rawPosition < role.rawPosition) ? roles.push(role) : '';});
					else msg.guild.roles.cache.forEach((role) => {separator.rawPosition < role.rawPosition ? roles.push(role) : '';});
					roles.sort((a,b) => b.rawPosition - a.rawPosition);
					embed.setDescription(`**${msg.lan2.separatorRole}**: ${separator}\n**${msg.lan2.stopRole}**: ${stopRole ? stopRole : msg.language.none}\n\n**${msg.lan2.affectedRoles}**:\n${roles.map(r => ` ${r}`)}`);
				}
			}
		}
		if (nr > res.rowCount-1) embed.setDescription(msg.lan2.notExistent);
		msg.client.ch.reply(msg, embed);
	}
};

async function checker(msg, res) {
	const sepend = [];
	const stopend = [];
	res.rows.forEach(row => {
		const sep = msg.guild.roles.cache.get(row.separator);
		const stop = msg.guild.roles.cache.get(row.stoprole);
		if (!sep || !sep.id) sepend.push(row.separator);
		if (!stop || !stop.id) stopend.push(row.stoprole);	
	});
	for (const s of sepend) {await msg.client.ch.query(`DELETE FROM roleseparator WHERE guildid = '${msg.guild.id}' AND separator = '${s}';`);}
	for (const s of sepend) {await msg.client.ch.query(`DELETE FROM roleseparator WHERE guildid = '${msg.guild.id}' AND stoprole = '${s}';`);}
	if (sepend.length > 0 || stopend.length > 0) return true;
	else return false;
}