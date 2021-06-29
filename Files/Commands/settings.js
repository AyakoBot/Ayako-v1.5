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
			if (msg.args[1] && file.perm && !msg.member.permissions.has(new Discord.Permissions(file.perm))) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
			else file.exe(msg);
		}
		settings = undefined;
	}
};