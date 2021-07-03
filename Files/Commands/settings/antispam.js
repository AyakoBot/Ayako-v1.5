const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const channelcheck = await channelchecker(msg, res);
				const rolecheck = await rolechecker(msg, res);
				if (channelcheck || rolecheck) r = (await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`)).rows[0];
				const embed = new Discord.MessageEmbed()
					.addField(msg.lan.antispam,r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, false)
					.addField(msg.lan.bpchannels, `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none}`, false)
					.addField(msg.lan.bpusers, `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}>`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none : msg.language.none}`, false)
					.addField(msg.lan.bproles, `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, false)
					.addField('\u200b', '\u200b', false)
					.addField('\u200b', `${msg.lan.readWarns}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan.muteAfter, {amount: r.muteafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.kickAfter, {amount: r.kickafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.banAfter, {amount: r.banafterwarnsamount})}`, false)
					.addField('\u200b', '\u200b', false)
					.addField(msg.lan.warn, r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
					.addField(msg.lan.mute, r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
					.addField(msg.lan.kick, r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
					.addField(msg.lan.ban, r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
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
		const res = await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const channelcheck = await channelchecker(msg, res);
			const rolecheck = await rolechecker(msg, res);
			if (channelcheck || rolecheck) r = (await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`)).rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.antispamtof.name, {trigger: msg.lan2.antispamtof.trigger.includes('`') ? msg.lan2.antispamtof.trigger : msg.lan2.antispamtof.trigger.map(f => `\`${f}\``)}), value: `${r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpchannelid.name, {trigger: msg.lan2.bpchannelid.trigger.includes('`') ? msg.lan2.bpchannelid.trigger : msg.lan2.bpchannelid.trigger.map(f => `\`${f}\``)}), value: `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpuserid.name, {trigger: msg.lan2.bpuserid.trigger.includes('`') ? msg.lan2.bpuserid.trigger : msg.lan2.bpuserid.trigger.map(f => `\`${f}\``)}), value: `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}>`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bproleid.name, {trigger: msg.lan2.bproleid.trigger.includes('`') ? msg.lan2.bproleid.trigger : msg.lan2.bproleid.trigger.map(f => `\`${f}\``)}), value: `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: '\u200b', value: `${msg.client.ch.stp(msg.lan2.readofwarnstof.name, {trigger: msg.lan2.readofwarnstof.trigger.includes('`') ? msg.lan2.readofwarnstof.trigger : msg.lan2.readofwarnstof.trigger.map(f => `\`${f}\``)})}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan2.muteafterwarnsamount.name, {amount: r.muteafterwarnsamount, trigger: msg.lan2.muteafterwarnsamount.trigger.includes('`') ? msg.lan2.muteafterwarnsamount.trigger : msg.lan2.muteafterwarnsamount.trigger.map(f => `\`${f}\``)})}\n${msg.client.ch.stp(msg.lan2.kickafterwarnsamount.name, {amount: r.kickafterwarnsamount, trigger: msg.lan2.kickafterwarnsamount.trigger.includes('`') ? msg.lan2.kickafterwarnsamount.trigger : msg.lan2.kickafterwarnsamount.trigger.map(f => `\`${f}\``)})}\n${msg.client.ch.stp(msg.lan2.banafterwarnsamount.name, {amount: r.banafterwarnsamount, trigger: msg.lan2.banafterwarnsamount.trigger.includes('`') ? msg.lan2.banafterwarnsamount.trigger : msg.lan2.banafterwarnsamount.trigger.map(f => `\`${f}\``)})}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.giveofficialwarnstof.name, {trigger: msg.lan2.giveofficialwarnstof.trigger.includes('`') ? msg.lan2.giveofficialwarnstof.trigger : msg.lan2.giveofficialwarnstof.trigger.map(f => `\`${f}\``)}), value: `${r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
					{name: msg.client.ch.stp(msg.lan2.muteenabledtof.name, {trigger: msg.lan2.muteenabledtof.trigger.includes('`') ? msg.lan2.muteenabledtof.trigger : msg.lan2.muteenabledtof.trigger.map(f => `\`${f}\``)}), value: `${r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
					{name: msg.client.ch.stp(msg.lan2.kickenabledtof.name, {trigger: msg.lan2.kickenabledtof.trigger.includes('`') ? msg.lan2.kickenabledtof.trigger : msg.lan2.kickenabledtof.trigger.map(f => `\`${f}\``)}), value: `${r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
					{name: msg.client.ch.stp(msg.lan2.banenabledtof.name, {trigger: msg.lan2.banenabledtof.trigger.includes('`') ? msg.lan2.banenabledtof.trigger : msg.lan2.banenabledtof.trigger.map(f => `\`${f}\``)}), value: `${r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
				)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			const m = await msg.client.ch.reply(msg, embed);
			msg.m = m;
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
					if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'mention' && name[i].replace(/bp/g, '').replace(/id/g, '')+'s' !== 'users') {
						const type = name[i].replace(/bp/g, '').replace(/id/g, '')+'s';
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
							.setCustomID('antispam')
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(take.length)
							.setPlaceholder(msg.language.select[type].select);
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
							.setDescription(`${msg.language.select[type].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
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
										.setCustomID('antispam')
										.addOptions(take)
										.setMinValues(1)
										.setMaxValues(take.length)
										.setPlaceholder(msg.language.select[type].select);
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
										.setDescription(`${msg.language.select[type].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
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
											if (r[name[i]] && r[name[i]].includes(id)) {
												const index = r[name[i]].indexOf(id);
												r[name[i]].splice(index, 1);
											} else if (r[name[i]] && r[name[i]].length > 0) r[name[i]].push(id);
											else r[name[i]] = [id];
										});
										if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
										else msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
									}
									const index = msg.args.indexOf(msg.language.edit);
									msg.args.splice(index, 1);
									setTimeout(() => {this.exe(msg);}, 3000);
								} else if (answer.customID == 'antispam') {
									answer.values.forEach(channel => {
										if (!answered.includes(channel)) answered.push(msg.guild[type].cache.get(channel).id);
										else answered.splice(answered.indexOf(channel), 1);
									});
									const menu = new Discord.MessageSelectMenu()
										.setCustomID('antispam')
										.addOptions(take)
										.setMinValues(1)
										.setMaxValues(take.length)
										.setPlaceholder(msg.language.select[type].select);
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
										.setDescription(`${msg.language.select[type].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
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
						m.edit({embeds: [editEmbed]}).catch(() => {});
						collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
						if (!collected.first()) return;
						answer = collected.first().content.toLowerCase();
						if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'number') {
							if (typeof parseInt(answer) == 'number' && !isNaN(answer)) {
								collected.first().delete().catch(() => {});
								const editedEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
									.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
									.addField(msg.lan.oldValue, `${r[name[i]]}`)
									.addField(msg.lan.newValue, answer);
								msg.m.edit({embeds: [editedEmbed]}).catch(() => {});
								msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								setTimeout(() => {this.exe(msg);}, 3000);
							} else this.notValid(msg, collected.first(), name[i]);
						} else if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'boolean') {
							const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
							if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
							else {
								collected.first().delete().catch(() => {});
								const editedEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
									.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
									.addField(msg.lan.oldValue, `${r[name[i]]}`)
									.addField(msg.lan.newValue, answer);
								m.edit({embeds: [editedEmbed]}).catch(() => {});
								msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								msg.m = m;
								setTimeout(() => {this.exe(msg);}, 3000);
							}
						} else if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'mention') {
							const type = name[i].replace(/bp/g, '').replace(/id/g, '')+'s';
							const args = answer.split(/ +/);
							const got = []; const fail = [];
							await Promise.all(args.map(async raw => {
								const id = raw.replace(/\D+/g, '');
								const request = await msg.client[type].fetch(id).catch(() => {});
								if (!request || !request.id) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.no}`);
								else got.push(id);
							}));
							collected.first().delete().catch(() => {});
							const endEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}));
							if (got.length > 0) endEmbed.addField(msg.language.finished, `${got.map(a => a)}`);
							if (fail.length > 0) endEmbed.addField(msg.language.failed, `${fail.map(a => a)}`);
							msg.m.edit({embeds: [endEmbed]}).catch(() => {});
							if (got.length > 0) {
								got.forEach(id => { 
									if (r[name[i]] && r[name[i]].includes(id)) {
										const index = r[name[i]].indexOf(id);
										r[name[i]].splice(index, 1);
									} else if (r[name[i]] && r[name[i]].length > 0) r[name[i]].push(id);
									else r[name[i]] = [id];
								});
								if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
								else msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
							}
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							setTimeout(() => {this.exe(msg);}, 3000);
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
			await msg.client.ch.query(`INSERT INTO antispamsettings (antispamtof, giveofficialwarnstof, muteafterwarnsamount, kickafterwarnsamount, banafterwarnsamount, readofwarnstof, muteenabledtof, kickenabledtof, banenabledtof, guildid) VALUES (true, true, 3, 5, 6, true, true, false, true, '${msg.guild.id}');`);
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

async function channelchecker(msg, res) {
	const r = res.rows[0];
	if (!r.bpchannelid || r.bpchannelid.length < 0) return false;
	else {
		r.bpchannelid.forEach((channelid) => {
			const channel = msg.guild.channels.cache.get(channelid);
			if (!channel) {
				const index = r.bpchannelid.indexOf(channelid);
				if (index > -1) r.bpchannelid.splice(index, 1);
				if (r.bpchannelid.length == 0) msg.client.ch.query(`UPDATE antispamsettings SET bpchannelid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE antispamsettings SET bpchannelid = ARRAY[${r.bpchannelid}] WHERE guildid = '${msg.guild.id}';`);
				return true;
			} else if (channel && channel.id) return false;
		});
	}
}
async function rolechecker(msg, res) {
	const r = res.rows[0];
	if (!r.bproleid || r.bproleid.length < 0) return false;
	else {
		r.bproleid.forEach((roleid) => {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role) {
				const index = r.bproleid.indexOf(roleid);
				if (index > -1) r.bproleid.splice(index, 1);
				if (r.bproleid.length == 0) msg.client.ch.query(`UPDATE antispamsettings SET bproleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE antispamsettings SET bproleid = ARRAY[${r.bproleid}] WHERE guildid = '${msg.guild.id}';`);
				return true;
			} else if (role && role.id) return false;
		});
	}
}