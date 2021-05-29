const Discord = require('discord.js');

module.exports = {
	perm: 32n,
	type: 1,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const channelcheck = await channelchecker(msg, res);
				const rolecheck = await rolechecker(msg, res);
				if (channelcheck || rolecheck) r = (await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`)).rows[0];
				const embed = new Discord.MessageEmbed()
					.addFields(
						{name: msg.lan.antispam, value: r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
						{name: msg.lan.bpchannels, value: r.bpchannelid && r.bpchannelid !== [] ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none, inline: false},
						{name: msg.lan.bpusers, value: r.bpuserid && r.bpuserid !== [] ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none, inline: false},
						{name: msg.lan.bproles, value: r.bproleid && r.bproleid !== [] ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: '\u200b', value: `${msg.lan.readWarns}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan.muteAfter, {amount: r.muteafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.kickAfter, {amount: r.kickafterwarnsamount})}\n${msg.client.ch.stp(msg.lan.banAfter, {amount: r.banafterwarnsamount})}`, inline: false},
						{name: '\u200b', value: '\u200b', inline: false},
						{name: msg.lan.warn, value: r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
						{name: msg.lan.mute, value: r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
						{name: msg.lan.kick, value: r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
						{name: msg.lan.ban, value: r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix}));
				msg.client.ch.reply(msg, embed);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) {
					const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 30000});
					if (!collected || !collected.first()) return;
					else {
						const answer = collected.first().content.toLowerCase();
						if (answer == msg.language.edit) this.edit(msg);
					}
				}
			} else this.setup(msg);
		}
	},
	async edit(msg) {
		msg.lan2 = msg.lan.edit;
		const res = await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const channelcheck = await channelchecker(msg, res);
			const rolecheck = await rolechecker(msg, res);
			if (channelcheck || rolecheck) r = (await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`)).rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription(msg.lan2.howToEdit)
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.antispam.name, {trigger: msg.lan2.antispam.trigger}), value: r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpchannels.name, {trigger: msg.lan2.bpchannels.trigger}), value: r.bpchannelid && r.bpchannelid !== [] ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpusers.name, {trigger: msg.lan2.bpusers.trigger}), value: r.bpuserid && r.bpuserid !== [] ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bproles.name, {trigger: msg.lan2.bproles.trigger}), value: r.bproleid && r.bproleid !== [] ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: '\u200b', value: `${msg.client.ch.stp(msg.lan2.readWarns.name, {trigger: msg.lan2.readWarns.trigger})}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan2.muteAfter.name, {amount: r.muteafterwarnsamount, trigger: msg.lan2.muteAfter.trigger})}\n${msg.client.ch.stp(msg.lan2.kickAfter.name, {amount: r.kickafterwarnsamount, trigger: msg.lan2.kickAfter.trigger})}\n${msg.client.ch.stp(msg.lan2.banAfter.name, {amount: r.banafterwarnsamount, trigger: msg.lan2.banAfter.trigger})}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.warn.name, {trigger: msg.lan2.warn.trigger}), value: r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.mute.name, {trigger: msg.lan2.mute.trigger}), value: r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.kick.name, {trigger: msg.lan2.kick.trigger}), value: r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.ban.name, {trigger: msg.lan2.ban.trigger}), value: r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			const m = await msg.client.ch.reply(msg, embed);
			let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return;
			const editAnswers = {};
			let answer = collected.first().content.toLowerCase();
			msg.lan.edit = msg.lan.edit.map(o => o);
			for (let i = 0; i < msg.lan.edit.length; i++) {
				const name = Object.getOwnPropertyNames(msg.lan.edit);
				console.log(name);
				if (name[i] !== 'author' && name[i] !== 'howToEdit') {
					editAnswers[name[i]] = msg.lan.edit[name[i]].trigger;
					editAnswers[name[i]].forEach(l => {l.replace(/`/g, '')}); 
				}
			}
			console.log(editAnswers);
		} else this.setup(msg);
	},
	async setup(msg) {

	}
};




async function channelchecker(msg, res) {
	const r = res.rows[0];
	if (!r.bpchannelid) return false;
	else {
		r.bpchannelid.forEach((channelid) => {
			const channel = msg.guild.channels.cache.get(channelid);
			if (!channel) {
				const index = r.bpchannelid.indexOf(channelid);
				if (index > -1) r.bpchannelid.splice(index, 1);
				if (r.bpchannelid.length == 0) msg.client.ch.query(`UPDATE antispamsettings SET bpchannelid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE antispamsettings SET bpchannelid = ARRAY[${r.bpchannelid}] WHERE guildid = '${msg.guild.id}';`);
				return true;
			} else if (channel && channel.id) return false;
		});
	}
}
async function rolechecker(msg, res) {
	const r = res.rows[0];
	if (!r.bproleid) return false;
	else {
		r.bproleid.forEach((roleid) => {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role) {
				const index = r.bproleid.indexOf(roleid);
				if (index > -1) r.bproleid.splice(index, 1);
				if (r.bproleid.length == 0) msg.client.ch.query(`UPDATE antispamsettings SET bproleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE antispamsettings SET bproleid = ARRAY[${r.bproleid}] WHERE guildid = '${msg.guild.id}';`);
				return true;
			} else if (role && role.id) return false;
		});
	}
}