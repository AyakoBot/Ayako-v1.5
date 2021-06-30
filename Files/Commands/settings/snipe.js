const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM snipesettings WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const embed = new Discord.MessageEmbed()
					.addFields(
						{name: msg.lan.active, value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled},
						{name: msg.lan.blchannels, value: r.blchannelid && r.blchannelid !== [] ? `${r.blchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.blchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none, inline: false},
						{name: msg.lan.blroles, value: r.blroleid && r.blroleid !== [] ? `${r.blroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.blroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none, inline: false},
						{name: msg.lan.link, value: r.links ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled},
						{name: msg.lan.invite, value: r.invites ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled},
						{name: msg.lan.blwords, value: r.blwords ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled},
						{name: msg.lan.bots, value: r.bots ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix}));
				msg.m ? msg.m.edit(embed) : msg.client.ch.reply(msg, embed);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) {
					const collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 30000});
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
		const res = await msg.client.ch.query(`SELECT * FROM snipesettings WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.active.name, {trigger: msg.lan2.active.trigger.includes('`') ? msg.lan2.active.trigger : msg.lan2.active.trigger.map(f => `\`${f}\``)}), value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.blchannelid.name, {trigger: msg.lan2.blchannelid.trigger.includes('`') ? msg.lan2.blchannelid.trigger : msg.lan2.blchannelid.trigger.map(f => `\`${f}\``)}), value: r.blchannelid ?  `<#${r.blchannelid}>` : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.blroleid.name, {trigger: msg.lan2.blroleid.trigger.includes('`') ? msg.lan2.blroleid.trigger : msg.lan2.blroleid.trigger.map(f => `\`${f}\``)}), value: r.blroleid ?  `<#${r.blroleid}>` : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.links.name, {trigger: msg.lan2.links.trigger.includes('`') ? msg.lan2.links.trigger : msg.lan2.links.trigger.map(f => `\`${f}\``)}), value: r.links ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.invites.name, {trigger: msg.lan2.invites.trigger.includes('`') ? msg.lan2.invites.trigger : msg.lan2.invites.trigger.map(f => `\`${f}\``)}), value: r.invites ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.blwords.name, {trigger: msg.lan2.blwords.trigger.includes('`') ? msg.lan2.blwords.trigger : msg.lan2.blwords.trigger.map(f => `\`${f}\``)}), value: r.blwords ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bots.name, {trigger: msg.lan2.bots.trigger.includes('`') ? msg.lan2.bots.trigger : msg.lan2.bots.trigger.map(f => `\`${f}\``)}), value: r.bots ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
				)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			const m = await msg.client.ch.reply(msg, embed);
			let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
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
					collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.snipe[name[i]] == 'boolean') {
						const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
						collected.first().delete().catch(() => {});
						if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
						else {
							msg.client.ch.query(`UPDATE snipesettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
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
					} else if (msg.client.constants.commands.settings.edit.snipe[name[i]] == 'mention') {
						const type = name[i].replace(/bl/g, '').replace(/id/g, '')+'s';
						const args = answer.split(/ +/);
						const got = []; const fail = [];
						await Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = type !== 'roles' ? (await msg.client[type].fetch(id).catch(() => {})) : (await msg.guild[type].fetch(id));
							if (!request || !request.id) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.no}`);
							else {
								if (type !== 'users' && request.guild !== msg.guild) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.wrongGuild}`);
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
							if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE snipesettings SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
							else msg.client.ch.query(`UPDATE snipesettings SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
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
		let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
		if (!collected.first()) return;
		const answer = collected.first().content.toLowerCase();
		if (answer == msg.language.yes) {
			await msg.client.ch.query(`INSERT INTO snipesettings (guildid, links, invites, blwords, bots, active) VALUES ('${msg.guild.id}', false, false, false, false, true);`);
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