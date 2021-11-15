const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

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
					value: `${msg.lan.punishment}: ${punishment}\n${msg.lan.requiredWarns} ${r.warnamount}`,
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
				name: '\u200b',
				value: msg.client.ch.stp(msg.lan.warnamount, {warns: r.warnamount}),
				inline: false
			},
			{
				name: msg.lan.punishment,
				value: msg.language.autopunish[r.punishment],
				inline: false
			},
			{
				name: msg.lan.duration,
				value: moment.duration(+r.duration).format(`d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`),
				inline: false
			}
		);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.active.name)
			.setLabel(msg.lanSettings.active)
			.setStyle(r.active ? 'SUCCESS' : 'DANGER');
		const warnamount = new Discord.MessageButton()
			.setCustomId(msg.client.ch.stp(msg.lan.edit.warnamount.name, {warns: r.warnamount}))
			.setLabel(msg.lan.warnamount)
			.isvarying('SECONDARY');
		const punishment = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.punishment.name)
			.setLabel(msg.lan.punishment)
			.setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
		const duration = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.duration.name)
			.setLabel(msg.lan.duration)
			.setStyle('PRIMARY');
		return [[active], [warnamount, punishment, duration]];
	}
};
