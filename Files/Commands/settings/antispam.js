const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addField(msg.lan.type, r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, false)
			.addField(msg.lan.bpchannels, `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}>`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none : msg.language.none}`, false)
			.addField(msg.lan.bpusers, `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}>`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none : msg.language.none}`, false)
			.addField(msg.lan.bproles, `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, false)
			.addField('\u200b', '\u200b', false)
			.addField('\u200b', `${msg.lan.readWarns}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan.muteAfter, {amount: r.muteafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.kickAfter, {amount: r.kickafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.banAfter, {amount: r.banafterwarnsamount})}`, false)
			.addField('\u200b', '\u200b', false)
			.addField(msg.lan.warn, r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
			.addField(msg.lan.mute, r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
			.addField(msg.lan.kick, r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true)
			.addField(msg.lan.ban, r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, true);
		return embed;
	},
	editEmbed(msg, r) {
		const embed = new Discord.MessageEmbed()
			.addFields(
				{name: msg.client.ch.stp(msg.lan.edit.antispamtof.name, {trigger: msg.lan.edit.antispamtof.trigger}), value: `${r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.bpchannelid.name, {trigger: msg.lan.edit.bpchannelid.trigger}), value: `${r.bpchannelid && r.bpchannelid !== [] ? `${r.bpchannelid.map(id => ` <#${id}> (${id})`)}`.length > 0 ? r.bpchannelid.map(id => ` <#${id}> (${id})`) : msg.language.none : msg.language.none}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.bpuserid.name, {trigger: msg.lan.edit.bpuserid.trigger}), value: `${r.bpuserid && r.bpuserid !== [] ? `${r.bpuserid.map(id => ` <@${id}> (${id})`)}`.length > 0 ? r.bpuserid.map(id => ` <@${id}> (${id})`) : msg.language.none : msg.language.none}`, inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.bproleid.name, {trigger: msg.lan.edit.bproleid.trigger}), value: `${r.bproleid && r.bproleid !== [] ? `${r.bproleid.map(id => ` <@&${id}> (${id})`)}`.length > 0 ? r.bproleid.map(id => ` <@&${id}> (${id})`) : msg.language.none : msg.language.none}`, inline: false},
				{name: '\u200b', value: '\u200b', inline: false},
				{name: '\u200b', value: `${msg.client.ch.stp(msg.lan.edit.readofwarnstof.name, {trigger: msg.lan.edit.readofwarnstof.trigger})}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan.edit.muteafterwarnsamount.name, {amount: r.muteafterwarnsamount, trigger: msg.lan.edit.muteafterwarnsamount.trigger})}\n${msg.client.ch.stp(msg.lan.edit.kickafterwarnsamount.name, {amount: r.kickafterwarnsamount, trigger: msg.lan.edit.kickafterwarnsamount.trigger})}\n${msg.client.ch.stp(msg.lan.edit.banafterwarnsamount.name, {amount: r.banafterwarnsamount, trigger: msg.lan.edit.banafterwarnsamount.trigger})}`, inline: false},
				{name: '\u200b', value: '\u200b', inline: false},
				{name: msg.client.ch.stp(msg.lan.edit.giveofficialwarnstof.name, {trigger: msg.lan.edit.giveofficialwarnstof.trigger}), value: `${r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
				{name: msg.client.ch.stp(msg.lan.edit.muteenabledtof.name, {trigger: msg.lan.edit.muteenabledtof.trigger}), value: `${r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
				{name: msg.client.ch.stp(msg.lan.edit.kickenabledtof.name, {trigger: msg.lan.edit.kickenabledtof.trigger}), value: `${r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
				{name: msg.client.ch.stp(msg.lan.edit.banenabledtof.name, {trigger: msg.lan.edit.banenabledtof.trigger}), value: `${r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}`, inline: true},
			);
		return embed;
	},
	buttons(msg, r) {
		const active = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.antispamtof.trigger[1] ? msg.lan.edit.antispamtof.trigger[1].replace(/`/g, '') : msg.lan.edit.antispamtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.type)
			.setStyle(r.antispamtof ? 'SUCCESS' : 'DANGER');
		const rw = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.readofwarnstof.trigger[1] ? msg.lan.edit.readofwarnstof.trigger[1].replace(/`/g, '') : msg.lan.edit.readofwarnstof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.readWarns.replace(/\*/g, '').slice(0, 14))
			.setStyle(r.readofwarnstof ? 'SUCCESS' : 'DANGER');
		const wm = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.giveofficialwarnstof.trigger[1] ? msg.lan.edit.giveofficialwarnstof.trigger[1].replace(/`/g, '') : msg.lan.edit.giveofficialwarnstof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.warn)
			.setStyle(r.giveofficialwarnstof ? 'SUCCESS' : 'DANGER');
		const mm = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.muteenabledtof.trigger[1] ? msg.lan.edit.muteenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.muteenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.mute)
			.setStyle(r.muteenabledtof ? 'SUCCESS' : 'DANGER');
		const km = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.kickenabledtof.trigger[1] ? msg.lan.edit.kickenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.kickenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.kick)
			.setStyle(r.kickenabledtof ? 'SUCCESS' : 'DANGER');
		const bm = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.banenabledtof.trigger[1] ? msg.lan.edit.banenabledtof.trigger[1].replace(/`/g, '') : msg.lan.edit.banenabledtof.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.ban)
			.setStyle(r.banenabledtof ? 'SUCCESS' : 'DANGER');
		const channel = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.bpchannelid.trigger[1] ? msg.lan.edit.bpchannelid.trigger[1].replace(/`/g, '') : msg.lan.edit.bpchannelid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bpchannels)
			.setStyle('PRIMARY');
		const user = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.bpuserid.trigger[1] ? msg.lan.edit.bpuserid.trigger[1].replace(/`/g, '') : msg.lan.edit.bpuserid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bpusers)
			.setStyle('PRIMARY');
		const role = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.bproleid.trigger[1] ? msg.lan.edit.bproleid.trigger[1].replace(/`/g, '') : msg.lan.edit.bproleid.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.lan.bproles)
			.setStyle('PRIMARY');
		const maw = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.muteafterwarnsamount.trigger[1] ? msg.lan.edit.muteafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.muteafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.muteAfter.replace(/\*/g, ''), {amount: r.muteafterwarnsamount}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		const kaw = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.kickafterwarnsamount.trigger[1] ? msg.lan.edit.kickafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.kickafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.kickAfter.replace(/\*/g, ''), {amount: r.kickafterwarnsamount}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		const baw = new Discord.MessageButton()
			.setCustomID(`${msg.lan.edit.banafterwarnsamount.trigger[1] ? msg.lan.edit.banafterwarnsamount.trigger[1].replace(/`/g, '') : msg.lan.edit.banafterwarnsamount.trigger[0].replace(/`/g, '')}`)
			.setLabel(msg.client.ch.stp(msg.lan.banAfter.replace(/\*/g, ''), {amount: r.banafterwarnsamount}))
			.setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
		return [[active], [channel,user,role], [rw,maw,kaw,baw], [wm,mm,km,bm]];
	}
};