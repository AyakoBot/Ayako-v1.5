const Discord = require('discord.js');

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
					name: msg.lan.channelid, 
					value: `${r.channelid ? `<#${r.channelid}>` : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.approverroleid, 
					value: `${r.approverroleid && r.approverroleid.length > 0 ? r.approverroleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.anon, 
					value: r.anon ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.bluserid, 
					value: `${r.bluserid && r.bluserid.length > 0 ? r.bluserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.blroleid, 
					value: `${r.blroleid && r.blroleid.length > 0 ? r.blroleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
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
		const channelid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.channelid.name)
			.setLabel(msg.lan.channelid)
			.setStyle('PRIMARY');
		const bluserid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.bluserid.name)
			.setLabel(msg.lan.bluserid)
			.setStyle('PRIMARY');
		const blroleid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.blroleid.name)
			.setLabel(msg.lan.blroleid)
			.setStyle('PRIMARY');
		const approverroleid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.approverroleid.name)
			.setLabel(msg.lan.approverroleid)
			.setStyle('PRIMARY');
		return [[active], [channelid,approverroleid], [blroleid,bluserid]];
	}
};