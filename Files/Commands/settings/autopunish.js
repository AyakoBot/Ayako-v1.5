const Discord = require('discord.js');

module.exports = {
	perm: 8n,
	type: 2,
	setupRequired: false,
	async mmrEmbed(msg, res) {
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			const punishment = msg.language.autopunish[r.punishment];
			embed.addFields(
				{
					name: `${msg.language.number}: \`${r.id}\` | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.lan.punishment}: ${punishment}\n${msg.lan.stoprole}: ${r.stoprole ? stop : msg.language.none}\n${msg.language.affected}: ${affected} ${msg.language.roles}${msg.guild.members.cache.get(msg.client.user.id).roles.highest.rawPosition <= sep.rawPosition ? `\n${msg.client.constants.emotes.warning} ${msg.language.permissions.error.role}` : ''}`,
					inline: true
				}
			);
		}
		return embed;
	},
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed();
		embed.addFields(
			{
				name: msg.lanSettings.active,
				value: r.active ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
				inline: false
			},
			{
				name: msg.guild.members.cache.get(msg.client.user.id).roles.highest.rawPosition <= sep.rawPosition ? `${msg.client.constants.emotes.warning} ${msg.language.permissions.error.role}` : '\u200b',
				value: '\u200b',
				inline: false
			},
			{
				name: msg.lan.isvarying,
				value: r.isvarying ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
				inline: false
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: false
			},
			{
				name: msg.lan.separator,
				value: r.separator ? `${sep}` : msg.language.none,
				inline: false
			},
			{
				name: msg.lan.stoprole,
				value: r.stoprole ? `${stop}` : msg.language.none,
				inline: false
			},
			{
				name: msg.language.number,
				value: r.id ? `\`${r.id}\`` : msg.language.none,
				inline: false
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: false
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: false
			},
			{
				name: `${msg.language.affected} ${affected} ${msg.language.roles}`,
				value: `${`${affectedRoles.map(r => ` ${r}`)}`.length > 1020 ? msg.language.tooManyRoles : `${affectedRoles.map(r => ` ${r}`)}`.length > 0 ? affectedRoles.map(r => ` ${r}`) : `${msg.language.none}`}`,
				inline: false
			}
		);
		return embed;
	},
	buttons(msg, r) {
		if (r.isvarying == true) {
			const active = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.active.name)
				.setLabel(msg.lanSettings.active)
				.setStyle(r.active ? 'SUCCESS' : 'DANGER');
			const separator = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.separator.name)
				.setLabel(msg.lan.separator)
				.setStyle('SECONDARY');
			const stoprole = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.stoprole.name)
				.setLabel(msg.lan.stoprole)
				.setStyle('SECONDARY');
			const isvarying = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.isvarying.name)
				.setLabel(msg.lan.isvarying)
				.setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
			const oneTimeRunner = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.oneTimeRunner.name)
				.setLabel(msg.lan.oneTimeRunner)
				.setEmoji(msg.client.constants.emotes.warning)
				.setStyle('DANGER');
			return [[active], [separator, stoprole], [isvarying], [oneTimeRunner]];
		} else {
			const active = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.active.name)
				.setLabel(msg.lanSettings.active)
				.setStyle(r.active ? 'SUCCESS' : 'DANGER');
			const separator = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.separator.name)
				.setLabel(msg.lan.separator)
				.isvarying('SECONDARY');
			const isvarying = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.isvarying.name)
				.setLabel(msg.lan.isvarying)
				.setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
			const roles = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.roles.name)
				.setLabel(msg.lan.roles)
				.setStyle('PRIMARY');
			const oneTimeRunner = new Discord.MessageButton()
				.setCustomId(msg.lan.edit.oneTimeRunner.name)
				.setLabel(msg.lan.oneTimeRunner)
				.setEmoji(msg.client.constants.emotes.warning)
				.setStyle('DANGER');
			return [[active], [separator, roles], [isvarying], [oneTimeRunner]];
		}
	}
};
