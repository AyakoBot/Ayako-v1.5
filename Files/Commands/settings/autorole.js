const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: `${msg.lanSettings.active}`, 
					value: `${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`, 
					inline: false
				},
				{
					name: `${msg.lan.botRole}`, 
					value: `${r.botroleid && r.botroleid.length > 0 ? r.botroleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: `${msg.lan.userRole}`, 
					value: `${r.userroleid && r.userroleid.length > 0 ? r.userroleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: `${msg.lan.allRole}`, 
					value: `${r.allroleid && r.allroleid.length > 0 ? r.allroleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.active.name)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const bot = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.botRole.name)
			.setLabel(msg.lan.botRole)
			.setStyle('PRIMARY');
		const user = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.userRole.name)
			.setLabel(msg.lan.userRole)
			.setStyle('PRIMARY');
		const all = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.allRole.name)
			.setLabel(msg.lan.allRole)
			.setStyle('PRIMARY');
		return [[active], [bot,user,all]];
	}
};