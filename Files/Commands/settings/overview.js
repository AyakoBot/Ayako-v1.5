const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	displayEmbed(msg, r) {
		const small = `${msg.client.constants.emotes.small} ${msg.language.small}`;
		const big = `${msg.client.constants.emotes.big} ${msg.language.big}`;
		if (r.prefix && r.prefix.startsWith('{"') && r.prefix.endsWith('"}')) r.prefix = r.prefix.slice(2, r.prefix.length-2);
		if (r.muteroleid && r.muteroleid.startsWith('{"') && r.muteroleid.endsWith('"}')) r.muteroleid = r.muteroleid.slice(2, r.muteroleid.length-2);
		const embed = new Discord.MessageEmbed()
			.addFields(
				{
					name: msg.lan.prefix,
					value: `\`${msg.client.constants.standard.prefix}\` ${r.prefix ? `/ \`${r.prefix}\`` : ''}`,
					inline: true,
				},
				{
					name: msg.lan.interactionsmode,
					value: `${r.interactionsmode == false || r.interactionsmode == true ? r.interactionsmode == true ? small : big : small }`,
					inline: true,
				},
				{
					name: msg.lan.muteroleid,
					value: `${r.muteroleid ? msg.guild.roles.cache.get(r.muteroleid) ? `<@&${r.muteroleid}>` : msg.language.none : msg.guild?.roles.cache.find(r => r.name.toLowerCase() == msg.language.muted) ? `<@&${msg.guild?.roles.cache.find(r => r.name.toLowerCase() == msg.language.muted).id}>` : msg.language.none}`,
					inline: true
				},
				{
					name: msg.lan.lan,
					value: `${msg.client.constants.emotes.flags[r.lan]} | ${msg.language.languages[r.lan].name} | ${msg.language.languages[r.lan].status}`,
					inline: true
				}
			);
		return embed;
	},
	buttons(msg, r) {
		const prefix = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.prefix.name)
			.setLabel(msg.lan.prefix)
			.setStyle('SUCCESS');
		const interactionsmode = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.interactionsmode.name)
			.setLabel(msg.lan.interactionsmode)
			.setStyle('SECONDARY');
		const muteroleid = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.muteroleid.name)
			.setLabel(msg.lan.muteroleid)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const language = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.lan.name)
			.setLabel(msg.lan.lan)
			.setStyle('SECONDARY');
		return [[prefix,interactionsmode,muteroleid,language]];
	}

};