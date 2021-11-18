const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 2,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lanSettings.active,
					value: r.active ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
					inline: false
				},
				{
					name: '\u200b',
					value: `**${msg.lan.logName}**`,
					inline: false
				},
				{
					name: msg.lan.emojievents,
					value: `${r.emojievents && r.emojievents.length > 0 ? r.emojievents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.guildevents,
					value: `${r.guildevents && r.guildevents.length > 0 ? r.guildevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.inviteevents,
					value: `${r.inviteevents && r.inviteevents.length > 0 ? r.inviteevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.messageevents,
					value: `${r.messageevents && r.messageevents.length > 0 ? r.messageevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.roleevents,
					value: `${r.roleevents && r.roleevents.length > 0 ? r.roleevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.userevents,
					value: `${r.userevents && r.userevents.length > 0 ? r.userevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.voiceevents,
					value: `${r.voiceevents && r.voiceevents.length > 0 ? r.voiceevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.webhookevents,
					value: `${r.webhookevents && r.webhookevents.length > 0 ? r.webhookevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.channelevents,
					value: `${r.channelevents && r.channelevents.length > 0 ? r.channelevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.applicationevents,
					value: `${r.applicationevents && r.applicationevents.length > 0 ? r.applicationevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.stageinstanceevents,
					value: `${r.stageinstanceevents && r.stageinstanceevents.length > 0 ? r.stageinstanceevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.stickerevents,
					value: `${r.stickerevents && r.stickerevents.length > 0 ? r.stickerevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.threadevents,
					value: `${r.threadevents && r.threadevents.length > 0 ? r.threadevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.guildmemberevents,
					value: `${r.guildmemberevents && r.guildmemberevents.length > 0 ? r.guildmemberevents.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: '\u200b',
					value: `**${msg.lan.logName}**`,
					inline: false
				},
				{
					name: msg.lan.modlogs,
					value: `${r.modlogs && r.modlogs.length > 0 ? r.modlogs.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.settingslog,
					value: `${r.settingslog && r.settingslog.length > 0 ? r.settingslog.map(id => ` <#${id}>`) : msg.language.none}`,
					inline: true
				},
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.active.name)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');

		const guildevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.guildevents.name)
			.setLabel(msg.lan.guildevents)
			.setStyle('PRIMARY');
		const emojievents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.emojievents.name)
			.setLabel(msg.lan.emojievents)
			.setStyle('PRIMARY');
		const inviteevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.inviteevents.name)
			.setLabel(msg.lan.inviteevents)
			.setStyle('PRIMARY');
		const messageevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.messageevents.name)
			.setLabel(msg.lan.messageevents)
			.setStyle('PRIMARY');
		const roleevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.roleevents.name)
			.setLabel(msg.lan.roleevents)
			.setStyle('PRIMARY');
		const userevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.userevents.name)
			.setLabel(msg.lan.userevents)
			.setStyle('PRIMARY');
		const voiceevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.voiceevents.name)
			.setLabel(msg.lan.voiceevents)
			.setStyle('PRIMARY');
		const webhookevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.webhookevents.name)
			.setLabel(msg.lan.webhookevents)
			.setStyle('PRIMARY');
		const channelevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.channelevents.name)
			.setLabel(msg.lan.channelevents)
			.setStyle('PRIMARY');
		const applicationevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.applicationevents.name)
			.setLabel(msg.lan.applicationevents)
			.setStyle('PRIMARY');
		const stageinstanceevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.stageinstanceevents.name)
			.setLabel(msg.lan.stageinstanceevents)
			.setStyle('PRIMARY');
		const stickerevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.stickerevents.name)
			.setLabel(msg.lan.stickerevents)
			.setStyle('PRIMARY');
		const threadevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.threadevents.name)
			.setLabel(msg.lan.threadevents)
			.setStyle('PRIMARY');
		const guildmemberevents = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.guildmemberevents.name)
			.setLabel(msg.lan.guildmemberevents)
			.setStyle('PRIMARY');
		const modlogs = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.modlogs.name)
			.setLabel(msg.lan.modlogs)
			.setStyle('PRIMARY');
		const settingslog = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.settingslog.name)
			.setLabel(msg.lan.settingslog)
			.setStyle('PRIMARY');

		return [
			[active], 
			[guildevents, emojievents, inviteevents, messageevents, roleevents],
			[userevents, voiceevents, webhookevents, channelevents, applicationevents],
			[stageinstanceevents, stickerevents, threadevents, guildmemberevents],
			[modlogs, settingslog]
		];
	}
};