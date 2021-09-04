const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	displayEmbed(msg, r) {			
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active, 
					value: `${r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: msg.lan.blchannelid, 
					value: `${r.blchannelid && r.blchannelid.length > 0 ? r.blchannelid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.blroleid, 
					value: `${r.blroleid && r.blroleid.length > 0 ? r.blroleid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.lan.bluserid, 
					value: `${r.bluserid && r.bluserid.length > 0 ? r.bluserid.map(id => ` <#${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: msg.lan.links, 
					value: `${r.links ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.invites, 
					value: `${r.invites ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.blwords, 
					value: `${r.blwords ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.bots, 
					value: `${r.bots ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: false
				},
				{
					name: msg.lan.deleteable, 
					value: `${r.deleteable ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`,
					inline: true
				},
				{
					name: msg.lan.deletetime, 
					value: r.deletetime ? `\`${r.deletetime} ${msg.language.time.seconds}\`` : msg.language.none, 
					inline: true
				}
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.active.trigger[1] ? msg.lan.edit.active.trigger[1].replace(/`/g, '') : msg.lan.edit.active.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const channel = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.blchannelid.trigger[1] ? msg.lan.edit.blchannelid.trigger[1].replace(/`/g, '') : msg.lan.edit.blchannelid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.blchannelid)
			.setStyle('PRIMARY');
		const user = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bluserid.trigger[1] ? msg.lan.edit.bluserid.trigger[1].replace(/`/g, '') : msg.lan.edit.bluserid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bluserid)
			.setStyle('PRIMARY');
		const role = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.blroleid.trigger[1] ? msg.lan.edit.blroleid.trigger[1].replace(/`/g, '') : msg.lan.edit.blroleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.blroleid)
			.setStyle('PRIMARY');
		const links = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.links.trigger[1] ? msg.lan.edit.links.trigger[1].replace(/`/g, '') : msg.lan.edit.links.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.links)
			.setStyle(!r.links ? 'DANGER' : 'SECONDARY');
		const invites = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.invites.trigger[1] ? msg.lan.edit.invites.trigger[1].replace(/`/g, '') : msg.lan.edit.invites.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.invites)
			.setStyle(!r.invites ? 'DANGER' : 'SECONDARY');
		const blwords = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.blwords.trigger[1] ? msg.lan.edit.blwords.trigger[1].replace(/`/g, '') : msg.lan.edit.blwords.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.blwords)
			.setStyle(!r.blwords ? 'DANGER' : 'SECONDARY');
		const bots = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.bots.trigger[1] ? msg.lan.edit.bots.trigger[1].replace(/`/g, '') : msg.lan.edit.bots.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bots)
			.setStyle(!r.bots ? 'DANGER' : 'SECONDARY');
		const deleteable = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.deleteable.trigger[1] ? msg.lan.edit.deleteable.trigger[1].replace(/`/g, '') : msg.lan.edit.deleteable.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.deleteable.replace('{{trashcan}}', ''))
			.setStyle(!r.deleteable ? 'DANGER' : 'SECONDARY');
		const deletetime = new Discord.MessageButton()
			.setCustomId(`${msg.lan.edit.deletetime.trigger[1] ? msg.lan.edit.deletetime.trigger[1].replace(/`/g, '') : msg.lan.edit.deletetime.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.deletetime.replace(/\*/g, ''), {amount: r.deletetime ? `${r.deletetime} ${msg.language.time.seconds}` : '--'}))
			.setStyle('SECONDARY');
		return [[active], [channel,user,role], [links,invites,blwords,bots], [deleteable,deletetime]];
	}
};