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
					name: msg.lan.bantof,
					value: r.bantof ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
					inline: true
				},
				{
					name: msg.lan.kicktof,
					value: r.kicktof ? msg.client.constants.emotes.tick + ' ' + msg.language.enabled : msg.client.constants.emotes.cross + ' ' + msg.language.disabled,
					inline: true
				},
				{
					name: '\u200b',
					value: msg.lan.debugSettings,
					inline: false
				},
				{
					name: msg.lan.posttof,
					value: r.posttof ? r.posttof : msg.language.none,
					inline: true
				},
				{
					name: msg.lan.postchannel,
					value: `${r.postchannel ? `<#${r.postchannel}>` : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.pingusers,
					value: `${r.pingusers && r.pingusers.length > 0 ? r.pingusers.map(id => ` <@${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.pingroles,
					value: `${r.pingroles && r.pingroles.length > 0 ? r.pingroles.map(id => ` <@&${id}>`) : msg.language.none}`,
					inline: false
				},
				{
					name: msg.lan.debugmode,
					value: r.debugmode ? r.debugmode : msg.language.none,
					inline: true
				},
				{
					name: '\u200b',
					value: msg.lan.thresholdSettings,
					inline: false
				},
				{
					name: msg.lan.time,
					value: r.time ? moment.duration(+r.time).format(`m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`) : msg.language.none,
					inline: true
				},
				{
					name: msg.lan.jointhreshold,
					value: r.jointhreshold ? r.jointhreshold : msg.language.none,
					inline: true
				},
				{
					name: msg.lan.similaridthreshold,
					value: r.similaridthreshold ? r.similaridthreshold : msg.language.none,
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
		const ban = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.bantof.name)
			.setLabel(msg.lan.bantof)
			.setStyle(r.bantof ? 'SUCCESS' : 'DANGER');
		const kick = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.kicktof.name)
			.setLabel(msg.lan.kicktof)
			.setStyle(r.kicktof ? 'SUCCESS' : 'DANGER');
		const post = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.posttof.name)
			.setLabel(msg.lan.posttof)
			.setStyle(r.posttof ? 'SUCCESS' : 'SECONDARY');
		const debug = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.debugmode.name)
			.setLabel(msg.lan.debugmode)
			.setStyle(r.debugmode ? 'SUCCESS' : 'SECONDARY');
		const postchannel = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.postchannel.name)
			.setLabel(msg.lan.postchannel)
			.setStyle('PRIMARY');
		const pingusers = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.pingusers.name)
			.setLabel(msg.lan.pingusers)
			.setStyle('SECONDARY');
		const pingroles = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.pingroles.name)
			.setLabel(msg.lan.pingroles)
			.setStyle('SECONDARY');
		const time = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.time.name)
			.setLabel(msg.lan.time)
			.setStyle('PRIMARY');
		const jointhreshold = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.jointhreshold.name)
			.setLabel(msg.lan.jointhreshold)
			.setStyle('PRIMARY');
		const similaridthreshold = new Discord.MessageButton()
			.setCustomId(msg.lan.edit.similaridthreshold.name)
			.setLabel(msg.lan.similaridthreshold)
			.setStyle('PRIMARY');
		return [[active], [ban, kick], [post, postchannel, pingusers, pingroles, debug], [time, jointhreshold, similaridthreshold]];
	}
};