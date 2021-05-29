const Discord = require('discord.js');

module.exports = {
	perm: null,
	async exe(msg) {
		const interactionsmodeRes = await msg.client.ch.query(`SELECT * FROM interactionsmode WHERE guildid = '${msg.guild.id}';`);
		const interactionsMode = interactionsmodeRes.rows[0] ? interactionsmodeRes.rows[0].mode == true ? `${msg.client.constants.emotes.small} ${msg.language.small}` : `${msg.client.constants.emotes.big} ${msg.language.big}` :  `${msg.client.constants.emotes.small} ${msg.language.small}`;
		const prefixRes = await msg.client.ch.query(`SELECT * FROM prefix WHERE guildid = '${msg.guild.id}';`);
		const prefix = prefixRes.rows[0] ? `\`${msg.client.constants.standard.prefix}\`, \`${prefixRes.rows[0].prefix}\`` : `\`${msg.client.constants.standard.prefix}\``;
		const muteroleRes = await msg.client.ch.query(`SELECT * FROM muterole WHERE guildid = '${msg.guild.id}';`);
		const muteroles = muteroleRes.rows[0] ? msg.guild.roles.cache.get(muteroleRes.rows[0].muteroleid) ? msg.client.constants.emotes.tick+` ${msg.guild.roles.cache.get(muteroleRes.rows[0].muteroleid)}` : msg.client.constants.emotes.warning+' '+msg.lan.overview.muteRoleError : msg.client.constants.emotes.cross+' '+msg.language.none;
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.overview.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.addFields(
				{name: msg.language.prefix, value: prefix, inline: true},
				{name: msg.language.interactionsMode, value: interactionsMode, inline: true},
				{name: msg.language.muteRole, value: muteroles, inline: true},
			)
			.setColor(msg.client.constants.commands.settings.color);
		msg.client.ch.reply(msg, embed);
	} 
};