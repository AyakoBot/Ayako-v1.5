const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM disboard WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const embed = new Discord.MessageEmbed()
					.addFields(
						{name: msg.lan.active, value: r.enabled ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: msg.lan.role, value: r.role ?  `<@&${r.role}>` : msg.language.none, inline: false},
						{name: msg.lan.channel, value: r.channelid ? `<#${r.channelid}>` : msg.language.none, inline: false},
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix}));
				msg.m ? msg.m.edit(embed) : msg.client.ch.reply(msg, embed);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) {
					const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 30000});
					if (!collected || !collected.first()) return;
					else {
						const answer = collected.first().content.toLowerCase();
						if (answer == msg.language.edit) this.edit(msg);
					}
				}
			} else this.setup(msg);
		}
	},
	async edit(msg) {
		msg.lan2 = msg.lan.edit;
		const res = await msg.client.ch.query(`SELECT * FROM disboard WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.enabled.name, {trigger: msg.lan2.enabled.trigger.includes('`') ? msg.lan2.enabled.trigger : msg.lan2.enabled.trigger.map(f => `\`${f}\``)}), value: r.enabled ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.role.name, {trigger: msg.lan2.role.trigger.includes('`') ? msg.lan2.role.trigger : msg.lan2.role.trigger.map(f => `\`${f}\``)}), value: r.role ?  `<@&${r.role}>` : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.channelid.name, {trigger: msg.lan2.channelid.trigger.includes('`') ? msg.lan2.channelid.trigger : msg.lan2.channelid.trigger.map(f => `\`${f}\``)}), value: r.channelid ?  `<#${r.channelid}>` : msg.language.none, inline: false},
				)
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
					await m.edit(editEmbed).catch(() => {});
					collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.disboard[name[i]] == 'boolean') {
						const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
						if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
						else {
							collected.first().delete().catch(() => {});
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.oldValue, r[name[i]])
								.addField(msg.lan.newValue, answer);
							m.edit(editedEmbed).catch(() => {});
							msg.client.ch.query(`UPDATE disboard SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							msg.m = m;
							setTimeout(() => {this.exe(msg);}, 5000);
						}
					} else if (msg.client.constants.commands.settings.edit.disboard[name[i]] == 'mention') {
						const type = name[i].replace(/id/g, '')+'s';
						const args = answer.split(/ +/);
						const got = []; const fail = [];
						await Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = type !== 'roles' ? (await msg.client[type].fetch(id).catch(() => {})) : (await msg.guild[type].fetch(id));
							if (!request || !request.id) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.no}`);
							else {
								if (request.guild !== msg.guild) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.wrongGuild}`);
								else got.push(id);
							}
						}));
						collected.first().delete().catch(() => {});
						const endEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}));
						if (got.length > 0) endEmbed.addField(msg.language.finished, got.map(a => a));
						if (fail.length > 0) endEmbed.addField(msg.language.failed, fail.map(a => a));
						m.edit(endEmbed).catch(() => {});
						if (got.length > 0) {
							got.forEach(id => { 
								if (r[name[i]] && r[name[i]].includes(id)) {
									const index = r[name[i]].indexOf(id);
									r[name[i]].splice(index, 1);
								} else if (r[name[i]] && r[name[i]].length > 0) r[name[i]].push(id);
								else r[name[i]] = [id];
							});
							if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE disboard SET ${name[i]} = ${r[name[i]]} WHERE guildid = '${msg.guild.id}';`);
							else msg.client.ch.query(`UPDATE disboard SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
						}
						const index = msg.args.indexOf(msg.language.edit);
						msg.args.splice(index, 1);
						msg.m = m;
						setTimeout(() => {this.exe(msg);}, 5000);
					}
				} 
			}
		} else this.setup(msg);
	},
	async setup(msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.setup.question)
			.addField(msg.language.commands.settings.valid, msg.lan.setup.answers);
		msg.m = await msg.client.ch.reply(msg, embed);
		let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
		if (!collected.first()) return;
		const answer = collected.first().content.toLowerCase();
		if (answer == msg.language.yes) {
			await msg.client.ch.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', true);`);
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.setup.done, {loading: msg.client.constants.emotes.loading}));
			await msg.m.edit(endEmbed);
			setTimeout(() => {this.exe(msg);}, 5000);
		} else if (answer == msg.language.no) {
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.lan.setup.abort);
			msg.m.edit(endEmbed);
		}
	},
	async notValid(msg, m, name) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.edit.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.notValid)
			.addField(msg.language.commands.settings.valid, msg.lan2[name].answers)
			.setFooter(msg.lan.pleaseRestart);
		msg.client.ch.reply(m, embed);
	}
};