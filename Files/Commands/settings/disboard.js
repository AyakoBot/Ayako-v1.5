const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	perm: 32n,
	type: 0, 
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: msg.lan.roleid,
					value: r.roleid ? `<@&${r.roleid}>` : msg.language.none,
					inline: false
				},
				{
					name: msg.lan.channelid,
					value: r.channelid ? `<#${r.channelid}>` : msg.language.none,
					inline: false
				},
				{
					name: msg.lan.repeatreminder,
					value: `${moment.duration(r.repeatreminder * 60000).format(`h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`)}`,
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
		const role = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.roleid.name)
			.setLabel(msg.lan.roleid)
			.setStyle('PRIMARY');
		const channel = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.channelid.name)
			.setLabel(msg.lan.channelid)
			.setStyle('PRIMARY');
		const repeatreminder = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.repeatreminder.name)
			.setLabel(msg.lan.repeatreminder)
			.setStyle('SECONDARY');
		return [[active], [role,channel], [repeatreminder]];
	}
};