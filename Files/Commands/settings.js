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
	const embed = file.displayEmbed == 'function' ? file.displayEmbed(msg) : noEmbed(msg);
	embed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit, {prefix: msg.client.constants.standard.prefix})}\n\n${embed.description}`);
	embed.setColor(msg.client.constants.commands.settings.color);
	msg.client.ch.reply(msg, {embeds: [embed]});
	const collected = await msg.channel.awaitMessages({filter: (m) => m.author.id == msg.author.id, max: 1, time: 30000});
	if (!collected) return;
	if (collected.first() && collected.first().content == msg.language.edit) {
		if (file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		else edit(msg, file);
	}
}

async function edit(msg, file) {
	let additionalIdentifiers;
	file.name = msg.args[0].toLowerCase();
	if (file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
	msg.lanSettings = msg.language.commands.settings;
	const editEmbed = file.editEmbed == 'function' ? file.editEmbed(msg) : noEmbed(msg);
	editEmbed.setDescription(`${msg.client.ch.stp(msg.lanSettings.howToEdit2, {prefix: msg.client.constants.standard.prefix})}\n\n${editEmbed.description}`);
	editEmbed.setColor(msg.client.constants.commands.settings.color);
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
	const buttons = [];
	for (i = 0, j = rows.length; i < j; i += 5) {buttons.push(rows.slice(i, i+5));}
	if (msg.m) msg.m.edit({embeds: [editEmbed], components: buttons}).catch(() => {});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [editEmbed], components: buttons});
	const buttonsCollector = new Discord.MessageComponentInteractionCollector(msg.m, {time: 60000});
	const messageCollector = new Discord.MessageCollector(msg.channel, {time: 60000});
	buttonsCollector.on('collect', (answer) => {
		if (answer.user.id == msg.author.id) {
			Object.entries(msg.lan.edit).forEach(e => {
				if (e[1].name == answer.customID) {
					gotEditing(e, answer);
					buttonsCollector.stop();
					messageCollector.stop();
				}
			});
		} else msg.client.ch.notYours(answer, msg);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
	messageCollector.on('collect', (answer) => {
		if (answer.author.id == msg.author.id) {
			Object.entries(msg.lan.edit).forEach(e => {e[1].trigger.forEach(trigger => {
				if (trigger.replace(/`/g, '') == answer.content.toLowerCase()) {
					gotEditing(e);
					answer.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
				}});
			});
		}
	});
	function gotEditing(e, answer) {
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
		const type = settings == 'boolean' ? 'button' : settings == 'number' || settings == 'mention' ? 'select' : 'text';
		if (type == 'button') {
			if (settings == 'boolean') {
				const PRIMARY = new Discord.MessageButton()
					.setCustomID('true')
					.setLabel(msg.language.true)
					.setStyle('PRIMARY');
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
			buttonsCollector.on('collect', (answer) => {
				if (answer.user.id == msg.author.id) {
					buttonsCollector.stop();
					messageCollector.stop();
					if (answer.customID == 'true') newSetting = true;
					else if (answer.customID == 'false') newSetting = false;
					else if (answer.customID == 'back') return edit(msg, file);
					gotNewSettings(newSetting, answer);
				} else msg.client.ch.notYours(answer, msg);
			});
			buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
			messageCollector.on('collect', (answer) => {
				if (answer.author.id == msg.author.id) {
					newSetting = answer.content.toLowerCase() == msg.language.true.toLowerCase() ? true : answer.content.toLowerCase() == msg.language.false.toLowerCase() ? false : null;
					if (newSetting == null) return;
					answer.delete().catch(() => {});
					buttonsCollector.stop();
					messageCollector.stop();
					gotNewSettings(newSetting);
				}
			});
		} else if (type == 'select') {
			if (settings == 'mention') {

			}
		}
	}
	async function gotNewSettings(newSetting, answer) {
		let oldSettings;
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.constants.commands.settings.tablenames[file.name]} WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) oldSettings = res.rows[0];
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setColor(msg.client.constants.commands.settings.color)
			.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.loading}));
		if (oldSettings) embed.addField(msg.lanSettings.oldValue, oldSettings[msg.property]);
		embed.addField(msg.lanSettings.newValue, newSetting);
		if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: []}).catch(() => {});
		msg.client.ch.query(`UPDATE ${msg.constants.commands.settings.tablenames[file.name]} SET ${msg.property} = ${oldSettings[msg.property]} WHERE guildid = '${msg.guild.id}' ${additionalIdentifiers};`);
		setTimeout(() => {edit(msg, file);});
	}
}