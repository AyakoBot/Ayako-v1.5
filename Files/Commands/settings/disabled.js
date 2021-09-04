const Discord = require('discord.js');

module.exports = {
	perm: 8192n,
	type: 1,
	setupRequired: false,
	mmrEmbed(msg, res) {
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			embed.addFields(
				{
					name: `${msg.language.number}: \`${r.id}\` | ${msg.lan.commands}: ${r.commands.map(c => ` \`${c}\``)} | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.lan.channels}: ${r.channels.map(c => ` <#${c}>`)}`, 
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
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: msg.language.number, 
					value: r.id ? `\`${r.id}\`` : msg.language.none, 
					inline: true
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.commands, 
					value: `${r.commands && r.commands.length > 0 ? r.commands.map(id => ` \`${id}\``) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.channels, 
					value: `${r.channels && r.channels.length > 0 ? r.channels.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.bpuserid, 
					value: `${r.bpuserid && r.bpuserid.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.bluserid, 
					value: `${r.bluserid && r.bluserid.length > 0 ? r.bluserid.map(id => ` <@${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.bproleid, 
					value: `${r.bproleid && r.bproleid.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none}`, 
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
		const commands = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.commands.name)
			.setLabel(msg.lan.commands)
			.setStyle('SECONDARY');
		const channels = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.channels.name)
			.setLabel(msg.lan.channels)
			.setStyle('SECONDARY');
		const bpuserid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.bpuserid.name)
			.setLabel(msg.lan.bpuserid)
			.setStyle('PRIMARY');
		const bluserid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.bluserid.name)
			.setLabel(msg.lan.bluserid)
			.setStyle('PRIMARY');
		const bproleid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.bproleid.name)
			.setLabel(msg.lan.bproleid)
			.setStyle('PRIMARY');
		const blroleid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.blroleid.name)
			.setLabel(msg.lan.blroleid)
			.setStyle('PRIMARY');
		return [[active], [commands, channels], [bpuserid,bluserid,bproleid,blroleid]];
	}
};