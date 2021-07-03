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
						{name: msg.lan.active, value: `${r.enabled ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: msg.lan.role, value: `${r.role ?  `<@&${r.role}>` : msg.language.none}`, inline: false},
						{name: msg.lan.channel, value: `${r.channelid ? `<#${r.channelid}>` : msg.language.none}`, inline: false},
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix}));
				msg.m ? msg.m.edit({embeds: [embed]}) : msg.client.ch.reply(msg, embed);
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
		const res = await msg.client.ch.query(`SELECT * FROM disboard WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.enabled.name, {trigger: msg.lan2.enabled.trigger.includes('`') ? msg.lan2.enabled.trigger : msg.lan2.enabled.trigger.map(f => `\`${f}\``)}), value: `${r.enabled ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.role.name, {trigger: msg.lan2.role.trigger.includes('`') ? msg.lan2.role.trigger : msg.lan2.role.trigger.map(f => `\`${f}\``)}), value: `${r.role ?  `<@&${r.role}>` : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.channelid.name, {trigger: msg.lan2.channelid.trigger.includes('`') ? msg.lan2.channelid.trigger : msg.lan2.channelid.trigger.map(f => `\`${f}\``)}), value: `${r.channelid ?  `<#${r.channelid}>` : msg.language.none}`, inline: false},
				)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			msg.m = await msg.client.ch.reply(msg, embed);
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
					if (msg.client.constants.commands.settings.edit.disboard[name[i]] == 'mention' && name[i].replace(/id/g, '')+'s' !== 'users') {
						const type = name[i].replace(/id/g, '')+'s';
						const textType = name[i].replace(/id/g, '');
						const req = msg.guild[type].cache;
						req.sort((a,b) => a.rawPosition - b.rawPosition);
						const options = [];
						req.forEach(r => {
							if (type == 'channels') {
								if (r.type == 'text' || r.type == 'news' || r.type == 'news_thread' || r.type == 'public_thread' || r.type == 'private_thread') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id, description: r.parent ? `${r.parent.name}` : null});
							} else  if (type == 'roles') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id});
						});
						const take = [];
						for(let j = 0; j < 25; j++) {take.push(options[j]);}
						const menu = new Discord.MessageSelectMenu()
							.setCustomID('disboard')
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(textType.endsWith('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[textType].select);
						const next = new Discord.MessageButton()
							.setCustomID('next')
							.setLabel(msg.language.next)
							.setStyle('SUCCESS');
						const prev = new Discord.MessageButton()
							.setCustomID('prev')
							.setLabel(msg.language.prev)
							.setDisabled(true)
							.setStyle('DANGER');
						const done = new Discord.MessageButton()
							.setCustomID('done')
							.setLabel(msg.language.done)
							.setDisabled(true)
							.setStyle('PRIMARY');
						const embed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(`${msg.language.select[textType].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
						msg.m.edit({embeds: [embed], components: [[menu],[prev],[next],[done]]}).catch(() => {});
						const collector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
						const answered = [];
						collector.on('collect', (answer) => {
							if (answer.user.id == msg.author.id) {
								if (answer.customID == 'next' || answer.customID == 'prev') {
									let indexLast; let indexFirst;
									for (let j = 0; options.length > j; j++) {
										if (options[j] && options[j].value == answer.message.components[0].components[0].options[(answer.message.components[0].components[0].options.length-1)].value) indexLast = j;
										if (options[j] && options[j].value == answer.message.components[0].components[0].options[0].value) indexFirst = j;
									}
									take.splice(0, take.length);
									if (answer.customID == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
									if (answer.customID == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
									let page = answer.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
									answer.customID == 'next' ? page++ : page--;
									const menu = new Discord.MessageSelectMenu()
										.setCustomID('disboard')
										.addOptions(take)
										.setMinValues(1)
										.setMaxValues(textType.endsWith('s') ? take.length : 1)
										.setPlaceholder(msg.language.select[textType].select);
									const next = new Discord.MessageButton()
										.setCustomID('next')
										.setLabel(msg.language.next)
										.setStyle('SUCCESS');
									const prev = new Discord.MessageButton()
										.setCustomID('prev')
										.setLabel(msg.language.prev)
										.setStyle('DANGER');
									const done = new Discord.MessageButton()
										.setCustomID('done')
										.setLabel(msg.language.done)
										.setStyle('PRIMARY');
									if (answered.length > 0) done.setDisabled(false);
									else done.setDisabled(true);
									const embed = new Discord.MessageEmbed()
										.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
										.setDescription(`${msg.language.select[textType].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
									if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => type == 'channels' ? `<#${c}>` : `<@&${c}>`)} `);
									if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
									else next.setDisabled(false);
									if (page > 1) prev.setDisabled(false);
									else prev.setDisabled(true);
									answer.update({embeds: [embed], components: [[menu],[prev],[next],[done]]}).catch(() => {});
								} else if (answer.customID == 'done') {
									collector.stop('finished');
									const endEmbed = new Discord.MessageEmbed()
										.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
										.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}));
									answer.update({embeds: [endEmbed], components: []}).catch(() => {});
									if (answered.length > 0) {
										answered.forEach(id => { 
											if (textType.endsWith('s')) {
												if (r[name[i]] && r[name[i]].includes(id)) {
													const index = r[name[i]].indexOf(id);
													r[name[i]].splice(index, 1);
												} else if (r[name[i]] && r[name[i]].length > 0) r[name[i]].push(id);
												else r[name[i]] = [id];
											} else r[name[i]] = id;
										});
										if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE disboard SET ${name[i]} = ${r[name[i]]} WHERE guildid = '${msg.guild.id}';`);
										else msg.client.ch.query(`UPDATE disboard SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
									}
									const index = msg.args.indexOf(msg.language.edit);
									msg.args.splice(index, 1);
									setTimeout(() => {this.exe(msg);}, 3000);
								} else if (answer.customID == 'disboard') {
									answer.values.forEach(channel => {
										if (!answered.includes(channel)) answered.push(msg.guild[type].cache.get(channel).id);
										else answered.splice(answered.indexOf(channel), 1);
									});
									const menu = new Discord.MessageSelectMenu()
										.setCustomID('disboard')
										.addOptions(take)
										.setMinValues(1)
										.setMaxValues(textType.endsWith('s') ? take.length : 1)
										.setPlaceholder(msg.language.select[textType].select);
									const next = new Discord.MessageButton()
										.setCustomID('next')
										.setLabel(msg.language.next)
										.setStyle('SUCCESS');
									const prev = new Discord.MessageButton()
										.setCustomID('prev')
										.setLabel(msg.language.prev)
										.setStyle('DANGER');
									const done = new Discord.MessageButton()
										.setCustomID('done')
										.setLabel(msg.language.done)
										.setStyle('PRIMARY');
									if (answered.length > 0) done.setDisabled(false);
									else done.setDisabled(true);
									let page = answer.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
									const embed = new Discord.MessageEmbed()
										.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
										.setDescription(`${msg.language.select[textType].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
										.addField(msg.language.selected, `${answered.map(c => type == 'channels' ? `<#${c}>` : `<@&${c}>`)} `);
									answer.update({embeds: [embed], components: [[menu],[prev],[next],[done]]}).catch(() => {});
								}
							} else msg.client.ch.notYours(answer, msg);
						});
						collector.on('end', (collected, reason) => {
							if (reason !== 'finished') {
								const embed = new Discord.MessageEmbed()
									.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
									.setDescription(msg.language.timeError);
								msg.m.edit({embeds: [embed]}).catch(() => {});
							}
						});
					} else {
						const editEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.addField(msg.language.commands.settings.valid, msg.lan2[name[i]].answers);
						if (msg.lan2[name[i]].recommended) editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan.edit[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**\n\n'+msg.lan2[name[i]].recommended);
						else editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan2[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**');
						msg.m.edit({embeds: [editEmbed]}).catch(() => {});
						collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
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
									.addField(msg.lan.oldValue, `${r[name[i]]}`)
									.addField(msg.lan.newValue, answer);
								msg.m.edit({embeds: [editedEmbed]}).catch(() => {});
								msg.client.ch.query(`UPDATE disboard SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								setTimeout(() => {this.exe(msg);}, 3000);
							}
						}
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
			await msg.client.ch.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', true);`);
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.setup.done, {loading: msg.client.constants.emotes.loading}));
			msg.m.edit({embeds: [endEmbed]}).catch(() => {});
			setTimeout(() => {this.exe(msg);}, 3000);
		} else if (answer == msg.language.no) {
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.lan.setup.abort);
			msg.m.edit({embeds: [endEmbed]}).catch(() => {});
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