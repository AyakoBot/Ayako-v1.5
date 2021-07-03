const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
	perm: 8192n,
	type: 1,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const rolecheck = await rolechecker(msg, res);
				const channelcheck = await channelchecker(msg, res);
				if (rolecheck || channelcheck) r = (await msg.client.ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`)).rows[0];
				const wordArr = [];
				let wordText = '';
				if (r.words && r.words.length > 0) {
					for (let i = 0; i < r.words.length; i++) {
						wordArr[i] = `${r.words[i]}⠀`;
						wordText += wordArr[i]+new Array(22 - wordArr[i].length).join(' ');
					}
				} else (wordText = msg.language.none);
				const embed = new Discord.MessageEmbed()
					.setDescription(msg.lan.words+'\n\n'+msg.client.ch.makeCodeBlock(wordText))
					.addFields(
						{name: msg.lan.blacklist, value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
						{name: msg.lan.words, value: `${r.words && r.words !== [] ? `${r.words.map(word => `\`${word}\``)}`.length > 0 ? `${r.words.map(word => `\`${word}\``)}`.replace(/\n/, ' ') : msg.language.none : msg.language.none}`, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: msg.lan.bpchannels, value: `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none}`, inline: false},
						{name: msg.lan.bpusers, value: `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}>`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none : msg.language.none}`, inline: false},
						{name: msg.lan.bproles, value: `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: msg.lan.punishments, value: `${msg.lan.warn}\n${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.lan.mute}\n${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.lan.kick}\n${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.lan.ban}\n${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
						{name: '\u200b', value: `${msg.client.ch.stp(msg.lan.warnAfter, {amount: r.warnafter})}\n${msg.client.ch.stp(msg.lan.muteAfter, {amount: r.muteafter})}\n${msg.client.ch.stp(msg.lan.kickAfter, {amount: r.kickafter})}\n${msg.client.ch.stp(msg.lan.banAfter, {amount: r.banafter})}\n`, inline: false},
						{name: msg.lan.clearInt, value: `${msg.lan.clearInt2+`\`${ms(parseInt(r.clearint))}\``}`, inline: false},
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
		const res = await msg.client.ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const rolecheck = await rolechecker(msg, res);
			if (rolecheck) r = (await msg.client.ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`)).rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.active.name, {trigger: msg.lan2.active.trigger.includes('`') ? msg.lan2.active.trigger : msg.lan2.active.trigger.map(f => `\`${f}\``)}), value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.words.name, {trigger: msg.lan2.words.trigger.includes('`') ? msg.lan2.words.trigger : msg.lan2.words.trigger.map(f => `\`${f}\``)}), value: `${r.words && r.words !== [] ? `${r.words.map(word => `\`${word}\``)}`.length > 0 ? `${r.words.map(word => `\`${word}\``)}`.replace(/\n/, ' ') : msg.language.none : msg.language.none}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpchannelid.name, {trigger: msg.lan2.bpchannelid.trigger.includes('`') ? msg.lan2.bpchannelid.trigger : msg.lan2.bpchannelid.trigger.map(f => `\`${f}\``)}), value: `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpuserid.name, {trigger: msg.lan2.bpuserid.trigger.includes('`') ? msg.lan2.bpuserid.trigger : msg.lan2.bpuserid.trigger.map(f => `\`${f}\``)}), value: `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}>`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bproleid.name, {trigger: msg.lan2.bproleid.trigger.includes('`') ? msg.lan2.bproleid.trigger : msg.lan2.bproleid.trigger.map(f => `\`${f}\``)}), value: `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.lan.punishments, value: `${msg.client.ch.stp(msg.lan2.warntof.name, {trigger: msg.lan2.warntof.trigger.includes('`') ? msg.lan2.warntof.trigger : msg.lan2.warntof.trigger.map(f => `\`${f}\``)})}\n${r.warntof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.client.ch.stp(msg.lan2.mutetof.name, {trigger: msg.lan2.mutetof.trigger.includes('`') ? msg.lan2.mutetof.trigger : msg.lan2.mutetof.trigger.map(f => `\`${f}\``)})}\n${r.mutetof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.client.ch.stp(msg.lan2.kicktof.name, {trigger: msg.lan2.kicktof.trigger.includes('`') ? msg.lan2.kicktof.trigger : msg.lan2.kicktof.trigger.map(f => `\`${f}\``)})}\n${r.kicktof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n${msg.client.ch.stp(msg.lan2.bantof.name, {trigger: msg.lan2.bantof.trigger.includes('`') ? msg.lan2.bantof.trigger : msg.lan2.bantof.trigger.map(f => `\`${f}\``)})}\n${r.bantof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
					{name: '\u200b', value: `${msg.client.ch.stp(msg.lan2.warnafter.name, {amount: r.warnafter, trigger: msg.lan2.warnafter.trigger.includes('`') ? msg.lan2.warnafter.trigger : msg.lan2.warnafter.trigger.map(f => `\`${f}\``)})}\n${msg.client.ch.stp(msg.lan2.muteafter.name, {amount: r.muteafter, trigger: msg.lan2.muteafter.trigger.includes('`') ? msg.lan2.muteafter.trigger : msg.lan2.muteafter.trigger.map(f => `\`${f}\``)})}\n${msg.client.ch.stp(msg.lan2.kickafter.name, {amount: r.kickafter, trigger: msg.lan2.kickafter.trigger.includes('`') ? msg.lan2.kickafter.trigger : msg.lan2.kickafter.trigger.map(f => `\`${f}\``)})}\n${msg.client.ch.stp(msg.lan2.banafter.name, {amount: r.banafter, trigger: msg.lan2.banafter.trigger.includes('`') ? msg.lan2.banafter.trigger : msg.lan2.banafter.trigger.map(f => `\`${f}\``)})}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.clearint.name, {trigger: msg.lan2.clearint.trigger.includes('`') ? msg.lan2.clearint.trigger : msg.lan2.clearint.trigger.map(f => `\`${f}\``)}), value: `\`${ms(parseInt(r.clearint))}\``, inline: false},
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
					if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'mention' && name[i].replace(/bp/g, '').replace(/id/g, '')+'s' !== 'users') {
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
							.setCustomID('blacklist')
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
										.setCustomID('blacklist')
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
										if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
										else msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
									}
									const index = msg.args.indexOf(msg.language.edit);
									msg.args.splice(index, 1);
									setTimeout(() => {this.exe(msg);}, 3000);
								} else if (answer.customID == 'blacklist') {
									answer.values.forEach(channel => {
										if (!answered.includes(channel)) answered.push(msg.guild[type].cache.get(channel).id);
										else answered.splice(answered.indexOf(channel), 1);
									});
									const menu = new Discord.MessageSelectMenu()
										.setCustomID('blacklist')
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
						msg.m.edit({embeds: [editEmbed]}).catch((e) => {console.log(e)});
						collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
						if (!collected.first()) return;
						answer = collected.first().content.toLowerCase();
						if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'number') {
							if (typeof parseInt(answer) == 'number' && !isNaN(answer)) {
								collected.first().delete().catch(() => {});
								const editedEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
									.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
									.addField(msg.lan.oldValue, `${r[name[i]]}`)
									.addField(msg.lan.newValue, answer);
								msg.m.edit({embeds: [editedEmbed]}).catch(() => {});
								msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								setTimeout(() => {this.exe(msg);}, 3000);
							} else this.notValid(msg, collected.first(), name[i]);
						} else if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'boolean') {
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
								msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								setTimeout(() => {this.exe(msg);}, 3000);
							}
						} else if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'mention') {
							const args = answer.split(/ +/);
							const got = []; const fail = [];
							await Promise.all(args.map(async raw => {
								const id = raw.replace(/\D+/g, '');
								const request = await msg.client.users.fetch(id).catch(() => {});
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
								if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
								else msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
							}
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							setTimeout(() => {this.exe(msg);}, 3000);
						} else if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'time') {
							collected.first().delete().catch(() => {});
							if (isNaN(ms(answer))) this.notValid(msg, msg.m, name);
							else {
								const int = ms(answer);
								const editedEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
									.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
									.addField(msg.lan.oldValue, `${r[name[i]]}`)
									.addField(msg.lan.newValue, answer);
								msg.m.edit({embeds: [editedEmbed]}).catch(() => {});
								msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ${int} WHERE guildid = '${msg.guild.id}';`);
								const index = msg.args.indexOf(msg.language.edit);
								msg.args.splice(index, 1);
								setTimeout(() => {this.exe(msg);}, 3000);
							}
						} else if (msg.client.constants.commands.settings.edit.blacklist[name[i]] == 'string') {
							const newWords = [];
							collected.first().delete().catch(() => {});
							const args = answer.split(/#+/);
							await Promise.all(args.map(async word => {
								if (word.startsWith(' ')) word = word.slice(1);
								if (word.endsWith(' ')) word = word.slice(0 ,-1);
								if (r.words && r.words.length > 0 && r.words.includes(word)) r.words.splice(`'${r.words.indexOf(word)}'`, 1);
								else newWords.push(`'${word}'`);
							}));
							if (r.words) for (let i = 0; i < r.words.length; i++) {if (!r.words[i].startsWith('\'') && !r.words[i].endsWith('\'')) r.words[i] = `'${r.words[i]}'`;}
							if (r.words && r.words.length > 0) r.words = r.words.concat(newWords);
							else r.words = newWords;
							if (r.words.length > 0) msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = ARRAY[${r.words}] WHERE guildid = '${msg.guild.id}';`);
							else msg.client.ch.query(`UPDATE blacklist SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.words, `${r[name[i]] && r[name[i]] !== [] ? `${r[name[i]].map(word => ` \`${word}\``)}`.length > 0 ? `${r[name[i]].map(word => `\`${word}\``)}`.replace(/\n/g, '') : msg.language.none : msg.language.none}`);
							msg.m.edit({embeds: [editedEmbed]}).catch(() => {});
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
			await msg.client.ch.query(`INSERT INTO blacklist (guildid, active, warntof, mutetof, kicktof, bantof, warnafter, muteafter, kickafter, banafter, clearint) VALUES ('${msg.guild.id}', true, true, true, false, true, 4, 6, 8, 10, 86400000);`);
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
				if (r.bpchannelid.length == 0) msg.client.ch.query(`UPDATE blacklist SET bpchannelid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE blacklist SET bpchannelid = ARRAY[${r.bpchannelid}] WHERE guildid = '${msg.guild.id}';`);
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
				if (r.bproleid.length == 0) msg.client.ch.query(`UPDATE blacklist SET bproleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE blacklist SET bproleid = ARRAY[${r.bproleid}] WHERE guildid = '${msg.guild.id}';`);
				return true;
			} else if (role && role.id) return false;
		});
	}
}