const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'settings',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	async exe(msg) {
		let settings = new Discord.Collection();
		const settingsFiles = fs.readdirSync('./Files/Commands/settings').filter(file => file.endsWith('.js'));
		for (const file of settingsFiles) {
			const settingsfile = require(`./settings/${file}`);
			settingsfile.name = file.replace('.js', '');
			settingsfile.category = msg.lan[settingsfile.name].category;
			settings.set(file.replace('.js', ''), settingsfile);
		}
		if (!msg.args[0]) {
			let categoryText = ''; const categories = []; 
			settings.forEach(setting => {setting.category.forEach(category => {if (!categories.includes(category)) categories.push(category);});});
			for (const category of categories) {
				const t = []; settings.forEach(s => {if (s.category.includes(category)) t.push(s.name);});
				for (let i = 0; i < t.length; i++) {
					const settingsFile = settings.get(t[i]);
					t[i] = `${settingsFile.type ? settingsFile.type == 1 ? msg.client.constants.emotes.yellow : settingsFile.type == 2 ? msg.client.constants.emotes.red : settingsFile.type == 3 ? msg.client.constants.emotes.blue : settingsFile.type == 4 ? msg.client.constants.emotes.green : msg.client.constants.emotes.blue : msg.client.constants.emotes.blue}${t[i]}⠀`;
					t[i] = t[i]+new Array(22 - t[i].length).join(' ');
				}
				categoryText += `__${category}__:\n\`\`\`${`${t.map(s => `${s}`)}`.replace(/,/g, '')}\`\`\`\n`;
			}
			const interactionsmodeRes = await msg.client.ch.query(`SELECT * FROM interactionsmode WHERE guildid = '${msg.guild.id}';`);
			const interactionsMode = interactionsmodeRes.rows[0] ? interactionsmodeRes.rows[0].mode == true ? `${msg.client.constants.emotes.small} ${msg.language.small}` : `${msg.client.constants.emotes.big} ${msg.language.big}` :  `${msg.client.constants.emotes.small} ${msg.language.small}`;
			const prefixRes = await msg.client.ch.query(`SELECT * FROM prefix WHERE guildid = '${msg.guild.id}';`);
			const prefix = prefixRes.rows[0] ? `\`${msg.client.constants.standard.prefix}\`, \`${prefixRes.rows[0].prefix}\`` : `\`${msg.client.constants.standard.prefix}\``;
			const muteroleRes = await msg.client.ch.query(`SELECT * FROM muterole WHERE guildid = '${msg.guild.id}';`);
			const muteroles = muteroleRes.rows[0] ? msg.guild.roles.cache.get(muteroleRes.rows[0].muteroleid) ? msg.client.constants.emotes.tick+` ${msg.guild.roles.cache.get(muteroleRes.rows[0].muteroleid)}` : msg.client.constants.emotes.warning+' '+msg.lan.overview.muteRoleError : msg.client.constants.emotes.cross+' '+msg.language.none;
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.overview.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.overview.desc, {prefix: msg.client.constants.standard.prefix, commands: categoryText})+'\n\n'+msg.client.ch.makeBold(msg.client.ch.makeUnderlined(msg.language.settingsOverview)))
				.addFields(
					{name: msg.language.prefix, value: prefix, inline: true},
					{name: msg.language.interactionsMode, value: interactionsMode, inline: true},
					{name: msg.language.muteRole, value: muteroles, inline: true},
				)
				.setColor(msg.client.constants.commands.settings.color);
			msg.client.ch.reply(msg, embed);
		} else {
			const file = settings.get(msg.args[0].toLowerCase());
			if (!file) return msg.client.ch.reply(msg, msg.lan.invalSettings);
			file.name == msg.args[0].toLowerCase();
			msg.lan = msg.lan[msg.args[0].toLowerCase()];
			if (!msg.args[1]) display(msg, file);
			else if (msg.args[1] && file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
			else edit(msg, file);
		}
		settings = undefined;
	}
};

function noEmbed(msg) {
	const embed = new Discord.MessageEmbed()
		.setAuthor(msg.client.ch.stp(msg.language.commands.settings.noEmbed.author, {type: ''}))
		.setDescription(msg.language.commands.settings.noEmbed.desc)
		.setColor(msg.client.constants.commands.settings.color);
	return embed;
}

async function display(msg, file) {
	msg.lanSettings = msg.language.commands.settings;
	let r;
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[file.name]} WHERE guildid = '${msg.guild.id}';`);
	if (res && res.rowCount > 0) r = res.rows[0];
	else return setup(msg);
	const embed = typeof(file.displayEmbed) == 'function' ? file.displayEmbed(msg, r) : noEmbed(msg);
	embed.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
	embed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit, {prefix: msg.client.constants.standard.prefix, type: file.name})}\n\n${embed.description ? embed.description : ''}`);
	embed.setColor(msg.client.constants.commands.settings.color);
	msg.client.ch.reply(msg, {embeds: [embed]});
	const collected = await msg.channel.awaitMessages({filter: (m) => m.author.id == msg.author.id, max: 1, time: 30000});
	if (!collected) return;
	if (collected.first() && collected.first().content == msg.language.edit) {
		if (file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		else edit(msg, file);
	}
}

async function edit(msg, file, answer) {
	let compatibilityType;
	let additionalIdentifiers; let r;
	file.name = msg.args[0].toLowerCase();
	msg.file = file;
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[file.name]} WHERE guildid = '${msg.guild.id}';`);
	if (res && res.rowCount > 0) r = res.rows[0];
	else return setup(msg);
	if (file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
	msg.lanSettings = msg.language.commands.settings;
	const editEmbed = typeof(file.editEmbed) == 'function' ? file.editEmbed(msg, r) : noEmbed(msg);
	editEmbed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit2, {prefix: msg.client.constants.standard.prefix, type: file.name})}\n\n${editEmbed.description ? editEmbed.description : ''}`);
	editEmbed.setColor(msg.client.constants.commands.settings.color);
	editEmbed.setAuthor(msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
	let rows = [];
	for (let o = 0; o < Object.keys(msg.lan.edit).length; o++) {
		const edit = Object.entries(msg.lan.edit)[o];
		const name = edit[1];
		const button = new Discord.MessageButton()
			.setCustomID(`${name.name}`)
			.setLabel(`${name.trigger[1] ? name.trigger[1].replace(/`/g, '') : name.trigger[0].replace(/`/g, '')}`)
			.setStyle('PRIMARY');
		rows.push(button);
	}
	let i; let j;
	let buttons = [];
	if (typeof(file.buttons) == 'function') buttons = file.buttons(msg, r);
	else for (i = 0, j = rows.length; i < j; i += 5) {buttons.push(rows.slice(i, i+5));}
	if (answer) answer.update({embeds: [editEmbed], components: buttons}).catch(() => {});
	else if (msg.m) msg.m.edit({embeds: [editEmbed], components: buttons}).catch(() => {});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [editEmbed], components: buttons});
	const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
	const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == clickButton.customID) editing = e;});});
			if (editing) {
				gotEditing(editing, clickButton);
				buttonsCollector.stop();
				messageCollector.stop();
			}
		} else msg.client.ch.notYours(clickButton, msg);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id) {
			if (message.content == msg.language.cancel) return aborted(msg, [messageCollector, buttonsCollector]);
			let editing;
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {if (trigger.replace(/`/g, '') == message.content.toLowerCase()) editing = e;});});
			if (editing) {
				gotEditing(editing);
				message.delete().catch(() => {});
				buttonsCollector.stop();
				messageCollector.stop();
			}
		}
	});
	async function gotEditing(e, answer) {
		const propertyName = e[0];
		msg.property = propertyName;
		const editing = e[1];
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setColor(msg.client.constants.commands.settings.color);
		if (editing.name) embed.setDescription(`${editing.name.replace('[{{trigger}}] ', '')}`);
		if (editing.answers) embed.addField(msg.lanSettings.valid, editing.answers);
		if (editing.recommended) embed.addField('\u200b', editing.recommended);
		const settings = msg.client.constants.commands.settings.edit[file.name][propertyName];
		const type = settings == 'boolean' ? 'button' : settings == 'number' || settings == 'channel' || settings == 'channels' || settings == 'role' || settings == 'roles' ? 'select' : 'string';
		let answered = []; let fail = [];
		if (type == 'button') {
			if (settings == 'boolean') {
				const PRIMARY = new Discord.MessageButton()
					.setCustomID('true')
					.setLabel(msg.language.true)
					.setStyle('SUCCESS');
				const SECONDARY = new Discord.MessageButton()
					.setCustomID('false')
					.setLabel(msg.language.false)
					.setStyle('SECONDARY');
				const DANGER = new Discord.MessageButton()
					.setCustomID('back')
					.setLabel(msg.language.back)
					.setEmoji(msg.client.constants.emotes.back)
					.setStyle('DANGER');
				if (answer) answer.update({embeds: [embed], components: [[DANGER],[PRIMARY],[SECONDARY]]}).catch(() => {});
				else msg.m.edit({embeds: [embed], components: [[DANGER],[PRIMARY],[SECONDARY]]}).catch(() => {});
			}
			const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
			const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
			let newSetting;
			buttonsCollector.on('collect', (buttonClick) => {
				if (buttonClick.user.id == msg.author.id) {
					buttonsCollector.stop();
					messageCollector.stop();
					if (buttonClick.customID == 'true') newSetting = true;
					else if (buttonClick.customID == 'false') newSetting = false;
					else if (buttonClick.customID == 'back') return edit(msg, file, buttonClick);
					gotNewSettings(newSetting, null, buttonClick);
				} else msg.client.ch.notYours(buttonClick, msg);
			});
			buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return aborted(msg, [messageCollector, buttonsCollector]);
					newSetting = message.content.toLowerCase() == msg.language.true.toLowerCase() ? true : message.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
					if (newSetting == null) return notValid(msg);
					message.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
					gotNewSettings(newSetting);
				}
			});
		} else if (type == 'select') {
			if (settings == 'channels' || settings == 'roles' || settings == 'channel' || settings == 'role') {
				compatibilityType = settings.includes('s') ? settings : settings+'s';
				const req = msg.guild[compatibilityType].cache;
				req.sort((a,b) => a.rawPosition - b.rawPosition);
				const options = [];
				req.forEach(r => {
					if (compatibilityType == 'channels') {
						if (r.type == 'text' || r.type == 'news' || r.type == 'news_thread' || r.type == 'public_thread' || r.type == 'private_thread') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id, description: r.parent ? `${r.parent.name}` : null});
					} else  if (compatibilityType == 'roles') options.push({label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name, value: r.id});
				});
				const take = [];
				for(let j = 0; j < 25; j++) {take.push(options[j]);}
				const menu = new Discord.MessageSelectMenu()
					.setCustomID(msg.property)
					.addOptions(take)
					.setMinValues(1)
					.setMaxValues(settings.includes('s') ? take.length : 1)
					.setPlaceholder(msg.language.select[settings].select);
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
				const back = new Discord.MessageButton()
					.setCustomID('back')
					.setLabel(msg.language.back)
					.setEmoji(msg.client.constants.emotes.back)
					.setStyle('DANGER');
				const embed = new Discord.MessageEmbed()
					.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
					.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
				if (answer) answer.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
				else msg.m.edit({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
				const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
				const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id) {
						if (clickButton.customID == 'next' || clickButton.customID == 'prev') {
							let indexLast; let indexFirst;
							for (let j = 0; options.length > j; j++) {
								if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length-1)].value) indexLast = j;
								if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
							}
							take.splice(0, take.length);
							if (clickButton.customID == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
							if (clickButton.customID == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							clickButton.customID == 'next' ? page++ : page--;
							const menu = new Discord.MessageSelectMenu()
								.setCustomID(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
							const back = new Discord.MessageButton()
								.setCustomID('back')
								.setLabel(msg.language.back)
								.setEmoji(msg.client.constants.emotes.back)
								.setStyle('DANGER');
							if (answered.length > 0) done.setDisabled(false);
							else done.setDisabled(true);
							const embed = new Discord.MessageEmbed()
								.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
							if (answered.length > 0) embed.addField(msg.language.selected, `${answered.map(c => compatibilityType == 'channels' ? `<#${c}>` : compatibilityType == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
							if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
							else next.setDisabled(false);
							if (page > 1) prev.setDisabled(false);
							else prev.setDisabled(true);
							clickButton.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
						} else if (clickButton.customID == 'done') {
							if (compatibilityType == 'channels' || compatibilityType == 'roles') {
								if (answered.length > 0) {
									answered.forEach(id => { 
										if (r[msg.property] && r[msg.property].includes(id)) {
											const index = r[msg.property].indexOf(id);
											r[msg.property].splice(index, 1);
										} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
										else r[msg.property] = [id];
									});
								}
							} else if (compatibilityType == 'number') {
								if (answered.length > 0) {
									answered.forEach(id => { 
										if (r[msg.property] && r[msg.property].includes(id)) {
											const index = r[msg.property].indexOf(id);
											r[msg.property].splice(index, 1);
										} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
										else r[msg.property] = [id];
									});
								}
							}
							messageCollector.stop('finished');
							buttonsCollector.stop('finished');
							gotNewSettings(r[msg.property], null, clickButton);
						} else if (clickButton.customID == msg.property) {
							clickButton.values.forEach(val => {
								if (!answered.includes(val)) msg.guild[settings].cache.get(val) ? answered.push(msg.guild[settings].cache.get(val).id) : '';
								else answered.splice(answered.indexOf(val), 1);
							});
							const menu = new Discord.MessageSelectMenu()
								.setCustomID(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
							const back = new Discord.MessageButton()
								.setCustomID('back')
								.setLabel(msg.language.back)
								.setEmoji(msg.client.constants.emotes.back)
								.setStyle('DANGER');
							if (answered.length > 0) done.setDisabled(false);
							else done.setDisabled(true);
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							const embed = new Discord.MessageEmbed()
								.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
								.addField(msg.language.selected, `${answered.map(c => settings == 'channels' ? `<#${c}>` : settings == 'roles' ? `<@&${c}>` : ` ${c}`)} `);
							clickButton.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
						} else if (clickButton.customID == 'back') return edit(msg, msg.file, clickButton);
					} else msg.client.ch.notYours(clickButton, msg);
				});
				messageCollector.on('collect', async (message) => {
					if (msg.author.id == message.author.id) {
						if (message.content == msg.language.cancel) return aborted(msg, [messageCollector, buttonsCollector]);
						message.delete().catch(() => {});
						if (settings == 'role' || settings == 'channel') {
							const answerContent = msg.content.replace(/\D+/g, '');
							const result = msg.guild[compatibilityType].cache.get(answerContent);
							if (result) answered = r[msg.property];
							else notValid(msg);
						} else if (settings == 'roles' || settings == 'channels') {
							const args = message.content.split(/ +/);
							Promise.all(args.map(async raw => {
								const id = raw.replace(/\D+/g, '');
								const request = msg.guild[compatibilityType].cache.get(id);
								if ((!request || !request.id) && (!r[msg.property] || (r[msg.property] && !r[msg.property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
								else answered.push(id);
							}));
							if (answered.length > 0) {
								answered.forEach(id => { 
									if (r[msg.property] && r[msg.property].includes(id)) {
										const index = r[msg.property].indexOf(id);
										r[msg.property].splice(index, 1);
									} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
									else r[msg.property] = [id];
								});
							}
							answered = r[msg.property];
						} else return notValid(msg);
						buttonsCollector.stop('finished');
						messageCollector.stop('finished');
						gotNewSettings(answered, fail);
					}
				});
				buttonsCollector.on('end', (collected, reason) => {
					if (reason == 'time') {
						const embed = new Discord.MessageEmbed()
							.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.language.timeError);
						msg.m.edit({embeds: [embed], components: []}).catch(() => {});
					}
				});
			} else if (settings == 'number') {
				const req = [];
				for (let i = 0; i < 9999; i++) {req.push(i);}
				const options = [];
				req.forEach(r => {
					options.push({label: `${r}`, value: `${r}`});
				});
				const take = [];
				for(let j = 0; j < 25; j++) {take.push(options[j]);}
				const menu = new Discord.MessageSelectMenu()
					.setCustomID(msg.property)
					.addOptions(take)
					.setMinValues(1)
					.setMaxValues(settings.includes('s') ? take.length : 1)
					.setPlaceholder(msg.language.select[settings].select);
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
				const back = new Discord.MessageButton()
					.setCustomID('back')
					.setLabel(msg.language.back)
					.setEmoji(msg.client.constants.emotes.back)
					.setStyle('DANGER');
				const embed = new Discord.MessageEmbed()
					.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
					.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
				if (answer) answer.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
				else msg.m.edit({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
				const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
				const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id) {
						if (clickButton.customID == 'next' || clickButton.customID == 'prev') {
							let indexLast; let indexFirst;
							for (let j = 0; options.length > j; j++) {
								if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length-1)].value) indexLast = j;
								if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
							}
							take.splice(0, take.length);
							if (clickButton.customID == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
							if (clickButton.customID == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							clickButton.customID == 'next' ? page++ : page--;
							const menu = new Discord.MessageSelectMenu()
								.setCustomID(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
							const back = new Discord.MessageButton()
								.setCustomID('back')
								.setLabel(msg.language.back)
								.setEmoji(msg.client.constants.emotes.back)
								.setStyle('DANGER');
							if (answered.length > 0) done.setDisabled(false);
							else done.setDisabled(true);
							const embed = new Discord.MessageEmbed()
								.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
							if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
							if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
							else next.setDisabled(false);
							if (page > 1) prev.setDisabled(false);
							else prev.setDisabled(true);
							clickButton.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
						} else if (clickButton.customID == 'done') {
							if (answered.length > 0) r[msg.property] = answered;
							messageCollector.stop('finished');
							buttonsCollector.stop('finished');
							gotNewSettings(r[msg.property], null, clickButton);
						} else if (clickButton.customID == msg.property) {
							answered = clickButton.values[0];
							const menu = new Discord.MessageSelectMenu()
								.setCustomID(msg.property)
								.addOptions(take)
								.setMinValues(1)
								.setMaxValues(settings.includes('s') ? take.length : 1)
								.setPlaceholder(msg.language.select[settings].select);
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
							const back = new Discord.MessageButton()
								.setCustomID('back')
								.setLabel(msg.language.back)
								.setEmoji(msg.client.constants.emotes.back)
								.setStyle('DANGER');
							if (answered.length > 0) done.setDisabled(false);
							else done.setDisabled(true);
							let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
							const embed = new Discord.MessageEmbed()
								.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(`${msg.language.select[settings].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
								.addField(msg.language.selected, `${answered} `);
							clickButton.update({embeds: [embed], components: [[menu],[prev,next],[back,done]]}).catch(() => {});
						} else if (clickButton.customID == 'back') return edit(msg, msg.file, clickButton);
					} else msg.client.ch.notYours(clickButton, msg);
				});
				messageCollector.on('collect', async (message) => {
					if (msg.author.id == message.author.id) {
						if (message.content == msg.language.cancel) return aborted(msg, [messageCollector, buttonsCollector]);
						message.delete().catch(() => {});
						if (isNaN(parseInt(message.content))) return notValid(msg);
						answered = message.content.replace(/\D+/g, '').split(/ +/);
						if (answered.length > 0) {
							answered.forEach(id => { 
								if (r[msg.property] && r[msg.property].includes(id)) {
									const index = r[msg.property].indexOf(id);
									r[msg.property].splice(index, 1);
								} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
								else r[msg.property] = [id];
							});
						}
						messageCollector.stop();
						buttonsCollector.stop();
						gotNewSettings(r[msg.property], fail);
					}
				});
				buttonsCollector.on('end', (collected, reason) => {
					if (reason == 'time') {
						const embed = new Discord.MessageEmbed()
							.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.language.timeError);
						msg.m.edit({embeds: [embed]}).catch(() => {});
					}
				});
			}
		}  else if (type == 'string') {
			if (settings == 'users') {
				const embed = new Discord.MessageEmbed()
					.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
					.setDescription(`${msg.language.select[settings].select}`);
				const DANGER = new Discord.MessageButton()
					.setCustomID('back')
					.setLabel(msg.language.back)
					.setEmoji(msg.client.constants.emotes.back)
					.setStyle('DANGER');
				if (answer) answer.update({embeds: [embed], components: [[DANGER]]}).catch(() => {});
				else msg.m.edit({embeds: [embed], components: [[DANGER]]}).catch(() => {});
				const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
				const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
				messageCollector.on('collect', async (message) => {
					console.log(1);
					if (message.author.id == msg.author.id) {
						if (message.content == msg.language.cancel) return aborted(msg, [messageCollector, buttonsCollector]);
						message.delete().catch(() => {});
						const args = message.content.split(/ +/);
						let answered = [];
						await Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = await msg.client.users.fetch(id).catch(() => {});
							if ((!request || !request.id) && (!r[msg.property] || (r[msg.property] && !r[msg.property].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
							else answered.push(id);
						}));
						message.delete().catch(() => {});
						if (answered.length > 0) {
							answered.forEach(id => { 
								id = id.replace(/\D+/g, '');
								if (r[msg.property] && r[msg.property].includes(id)) {
									const index = r[msg.property].indexOf(id);
									r[msg.property].splice(index, 1);
								} else if (r[msg.property] && r[msg.property].length > 0) r[msg.property].push(id);
								else r[msg.property] = [id];
							});
						}
						messageCollector.stop();
						buttonsCollector.stop();
						gotNewSettings(r[msg.property], fail);
					}
				});
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id) {
						if (clickButton.customID == 'back') {
							buttonsCollector.stop();
							messageCollector.stop();
							return edit(msg, file, clickButton);
						}
					} else msg.client.ch.notYours(clickButton, msg);
				});
				buttonsCollector.on('end', (collected, reason) => {
					if (reason == 'time') {
						const embed = new Discord.MessageEmbed()
							.setAuthor(msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.language.timeError);
						msg.m.edit({embeds: [embed]}).catch(() => {});
					}
				});
			}
		}
	}
	async function gotNewSettings(answered, fail, answer) {
		let oldSettings;
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[file.name]} WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) oldSettings = res.rows[0];
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setColor(msg.client.constants.commands.settings.color)
			.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
		if (oldSettings) {
			if (Array.isArray(oldSettings[msg.property])) embed.addField(msg.lanSettings.oldValue, `${oldSettings[msg.property].map(f => msg.property.includes('user') ? ` <@${f}>` : msg.property.includes('role') ? ` <@&${f}>` : msg.property.includes('channel') ? ` <#${f}>` : ` ${f}`)}`);
			else embed.addField(msg.lanSettings.oldValue, `${oldSettings[msg.property]}`);
		}
		if ((answered !== undefined && answered !== null) || (answered.length > 0 && Array.isArray(answered))) {
			if (Array.isArray(answered)) embed.addField(msg.lanSettings.newValue, `${answered.length > 0 ? answered.map(f => compatibilityType == 'channels' ? ` <#${f}>` : compatibilityType == 'roles' ? ` <@&${f}>` : compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`) : msg.language.none}`);
			else embed.addField(msg.lanSettings.newValue, `${answered !== undefined && answered !== null ? answered : msg.language.none}`);
		}
		if (oldSettings && (answered !== undefined && answered !== null) || (answered.length > 0 && Array.isArray(answered))) log(oldSettings[msg.property], answered);
		else if ((answered !== undefined && answered !== null) || (answered.length > 0 && Array.isArray(answered))) log(null, answered);
		else if (oldSettings) log(oldSettings[msg.property], null);
		if (fail && fail.length > 0) {
			if (Array.isArray(fail)) embed.addField(msg.language.error, `${fail.map(f => ` ${f}`)}`);
			else embed.addField(msg.language.error, fail);
		}
		if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: []}).catch(() => {});
		r[msg.property] = answered;
		if (r[msg.property] !== undefined && r[msg.property] !== null) {
			if (Array.isArray(r[msg.property])) {
				if (r[msg.property].length > 0) msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[file.name]} SET ${msg.property} = ARRAY[${r[msg.property]}] WHERE guildid = '${msg.guild.id}' ${additionalIdentifiers ? ` AND ${additionalIdentifiers}` : ''};`); //`
				else msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[file.name]} SET ${msg.property} = null WHERE guildid = '${msg.guild.id}' ${additionalIdentifiers ? ` AND ${additionalIdentifiers}` : ''};`); //`
			} else msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[file.name]} SET ${msg.property} = ${r[msg.property]} WHERE guildid = '${msg.guild.id}' ${additionalIdentifiers ? ` AND ${additionalIdentifiers}` : ''};`); //`
			setTimeout(() => {edit(msg, file);}, 3000);
		}
	}
	async function log(before, after) {
		const embed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.commands.settings.log.color)
			.setTimestamp()
			.setAuthor(msg.client.ch.stp(msg.language.selfLog.author, {setting: msg.file.name}))
			.setDescription(msg.client.ch.stp(msg.language.selfLog.description, {msg: msg, setting: msg.file.name}));
		if (before !== null || (Array.isArray(before) && before.length > 0)) embed.addField(msg.lanSettings.oldValue, `${Array.isArray(before) ? before.map(f => compatibilityType == 'channels' ? ` <#${f}>` : compatibilityType == 'roles' ? ` <@&${f}>` : compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`) : before}`);
		if (after !== null || (Array.isArray(after) && after.length > 0)) embed.addField(msg.lanSettings.newValue, `${Array.isArray(after) ? after.map(f => compatibilityType == 'channels' ? ` <#${f}>` : compatibilityType == 'roles' ? ` <@&${f}>` : compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`) : after}`);
		const res = await msg.client.ch.query(`SELECT * FROM logchannels WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0 && res.rows[0].verbositylog) {
			const channel = msg.client.channels.cache.get(res.rows[0].verbositylog);
			if (channel) msg.client.ch.send(channel, {embeds: [embed]});
		}
	}
}



async function setup(msg) {
	const embed = new Discord.MessageEmbed()
		.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
		.setDescription(msg.lan.setup.question)
		.addField(msg.language.commands.settings.valid, msg.lan.setup.answers);
	msg.m = await msg.client.ch.reply(msg, embed);
	let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
	if (!collected.first()) return;
	const answer = collected.first().content.toLowerCase();
	if (answer == msg.language.yes) {
		await msg.client.ch.query(`INSERT INTO ${msg.client.constants.commands.settings.tablenames[msg.file.name]} (${msg.client.constants.commands.settings.setupQueries[msg.file.name].cols}) VALUES (${msg.client.constants.commands.settings.setupQueries[msg.file.name].vals});`);
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
}
async function notValid(msg) {
	const embed = new Discord.MessageEmbed()
		.setAuthor(`${msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type})}`, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
		.setDescription(`${msg.lanSettings.notValid}`)
		.setFooter(`${msg.lanSettings.pleaseRestart}`);
	if (msg.lan.edit[msg.property].answers) embed.addField(msg.language.commands.settings.valid, msg.lan.edit[msg.property].answers);
	msg.client.ch.reply(msg.m, embed);
}
async function aborted(msg, collectors) {
	collectors.forEach(collector => collector.stop());
	msg.m.delete().catch(() => {});
	msg.reply({content: msg.language.aborted});
}
