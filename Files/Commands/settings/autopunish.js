const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	perm: 8n,
	type: 2,
	setupRequired: false,
	async mmrEmbed(msg, res) {
		const embed = new Discord.MessageEmbed()
			.setDescription(msg.client.ch.stp(msg.lan.description, {prefix: msg.client.constants.standard.prefix}));
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			const punishment = msg.language.autopunish[r.punishment];
			embed.addFields(
				{
					name: `${msg.language.number}: \`${r.id}\` | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.lan.punishment}: ${punishment}\n${msg.lan.requiredWarns} ${r.warnamount ? r.warnamount : msg.language.none}`,
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
				value: msg.client.ch.stp(msg.lan.warnamount, { warns: r.warnamount ? r.warnamount : '--'}),
				inline: false
			},
			{
				name: msg.lan.punishment,
				value: msg.language.autopunish[r.punishment],
				inline: false
			},
			{
				name: msg.lan.duration,
				value: moment.duration(+r.duration).format(`Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`, { trim: 'all' }) ? moment.duration(+r.duration).format(`Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`, { trim: 'all' }) : msg.language.none,
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
			.setCustomId(msg.lan.edit.warnamount.name)
			.setLabel(msg.client.ch.stp(msg.lan.edit.warnamount.name, { warns: r.warnamount ? r.warnamount : '--' }).replace(/\**/g ,''))
			.setStyle('SECONDARY');
		const punishment = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.punishment.name)
			.setLabel(msg.lan.punishment)
			.setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
		const duration = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.duration.name)
			.setLabel(msg.lan.edit.duration.name)
			.setStyle('PRIMARY');
		return [[active], [warnamount, punishment, duration]];
	}
};
