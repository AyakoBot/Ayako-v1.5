const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 2,
	setupRequired: false,
	mmrEmbed(msg, res) {
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			embed.addFields(
				{
					name: `${msg.language.number}: \`${r.id}\` | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.language.affected}: ${r.roles.length}\n${msg.language.name}: ${r.name}`,
					inline: true
				}
			);
		}
		return embed;
	},
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active,
					value: r.active ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
					inline: false
				},
				{
					name: msg.lan.onlyone,
					value: r.onlyone ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
					inline: false
				},
				{
					name: msg.lan.roles,
					value: `${r.roles && r.roles.length > 0 ? r.roles.map(id => ` <@&${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.blacklistedusers,
					value: `${r.blacklistedusers && r.blacklistedusers.length > 0 ? r.blacklistedusers.map(id => ` <@${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.blacklistedroles,
					value: `${r.blacklistedroles && r.blacklistedroles.length > 0 ? r.blacklistedroles.map(id => ` <@&${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.whitelistedusers,
					value: `${r.whitelistedusers && r.whitelistedusers.length > 0 ? r.whitelistedusers.map(id => ` <@${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.whitelistedroles,
					value: `${r.whitelistedroles && r.whitelistedroles.length > 0 ? r.whitelistedroles.map(id => ` <@&${id}>`) : msg.language.none}`,
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
		const onlyone = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.onlyone.name)
			.setLabel(msg.lan.onlyone)
			.setStyle(r.onlyone ? 'SUCCESS' : 'DANGER');
		const blacklistedusers = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.blacklistedusers.name)
			.setLabel(msg.lan.blacklistedusers)
			.setStyle('PRIMARY');
		const blacklistedroles = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.blacklistedroles.name)
			.setLabel(msg.lan.blacklistedroles)
			.setStyle('PRIMARY');
		const whitelistedusers = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.whitelistedusers.name)
			.setLabel(msg.lan.whitelistedusers)
			.setStyle('PRIMARY');
		const whitelistedroles = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.whitelistedroles.name)
			.setLabel(msg.lan.whitelistedroles)
			.setStyle('PRIMARY');
		const roles = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.roles.name)
			.setLabel(msg.lan.roles)
			.setStyle('PRIMARY');
		return [[active], [onlyone, roles], [blacklistedusers, blacklistedroles], [whitelistedusers, whitelistedroles]];
	}
};