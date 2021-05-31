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
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.antispamtof.name, {trigger: msg.lan2.antispamtof.trigger}), value: r.antispamtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpchannelid.name, {trigger: msg.lan2.bpchannelid.trigger}), value: r.bpchannelid && r.bpchannelid !== [] ? r.bpchannelid.map(id => ` <#${id}>`) : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bpuserid.name, {trigger: msg.lan2.bpuserid.trigger}), value: r.bpuserid && r.bpuserid !== [] ? r.bpuserid.map(id => ` <@${id}>`) : msg.language.none, inline: false},
					{name: msg.client.ch.stp(msg.lan2.bproleid.name, {trigger: msg.lan2.bproleid.trigger}), value: r.bproleid && r.bproleid !== [] ? r.bproleid.map(id => ` <@&${id}>`) : msg.language.none, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: '\u200b', value: `${msg.client.ch.stp(msg.lan2.readofwarnstof.name, {trigger: msg.lan2.readofwarnstof.trigger})}\n${r.readofwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled}\n\n${msg.client.ch.stp(msg.lan2.muteafterwarnsamount.name, {amount: r.muteafterwarnsamount, trigger: msg.lan2.muteafterwarnsamount.trigger})}\n${msg.client.ch.stp(msg.lan2.kickafterwarnsamount.name, {amount: r.kickafterwarnsamount, trigger: msg.lan2.kickafterwarnsamount.trigger})}\n${msg.client.ch.stp(msg.lan2.banafterwarnsamount.name, {amount: r.banafterwarnsamount, trigger: msg.lan2.banafterwarnsamount.trigger})}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: msg.client.ch.stp(msg.lan2.giveofficialwarnstof.name, {trigger: msg.lan2.giveofficialwarnstof.trigger}), value: r.giveofficialwarnstof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.muteenabledtof.name, {trigger: msg.lan2.muteenabledtof.trigger}), value: r.muteenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.kickenabledtof.name, {trigger: msg.lan2.kickenabledtof.trigger}), value: r.kickenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
					{name: msg.client.ch.stp(msg.lan2.banenabledtof.name, {trigger: msg.lan2.banenabledtof.trigger}), value: r.banenabledtof ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, inline: true},
				)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			const m = await msg.client.ch.reply(msg, embed);
			let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return;
			const editAnswers = {};
			let answer = collected.first().content.toLowerCase();
			for (let i = 0; i < Object.keys(msg.lan.edit).length; i++) {
				const name = Object.getOwnPropertyNames(msg.lan.edit);
				if (name[i] !== 'author' && name[i] !== 'howToEdit') {
					editAnswers[name[i]] = msg.lan.edit[name[i]].trigger;
					for (let j = 0; j < Object.keys(editAnswers[name[i]]).length; j++) {editAnswers[name[i]][j] = editAnswers[name[i]][j].replace(/`/g, '');}
				}
			}
			for (let i = 0; i < Object.keys(editAnswers).length; i++) {
				const name = Object.getOwnPropertyNames(editAnswers);
				if (editAnswers[name[i]].includes(answer)) {
					collected.first().delete().catch(() => {});
					const editEmbed = new Discord.MessageEmbed()
						.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
						.addField(msg.lan.valid, msg.lan2[name[i]].answers);
					if (msg.lan2[name[i]].recommended) editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan.edit[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**\n\n'+msg.lan2[name[i]].recommended);
					else editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan2[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**');
					await m.edit(editEmbed).catch(() => {});
					collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'number') {
						if (typeof parseInt(answer) == 'number' && !isNaN(answer)) {
							collected.first().delete().catch(() => {});
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.oldValue, r[name[i]])
								.addField(msg.lan.newValue, answer);
							m.edit(editedEmbed).catch(() => {});
							msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
						} else this.notValid(msg, collected.first(), name[i]);
					} else if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'boolean') {
						const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
						if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
						else {
							collected.first().delete().catch(() => {});
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.oldValue, r[name[i]])
								.addField(msg.lan.newValue, answer);
							m.edit(editedEmbed).catch(() => {});
							console.log(`UPDATE antispamsettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
							msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
						}
					} else if (msg.client.constants.commands.settings.edit.antispam[name[i]] == 'mention') {
						const type = name[i].replace(/bp/g, '').replace(/id/g, '')+'s';
						const args = answer.split(/ +/);
						const got = []; const fail = [];
						await Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = type !== 'roles' ? (await msg.client[type].fetch(id).catch(() => {})) : (await msg.guild[type].fetch(id));
							if (!request || !request.id) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.no}`);
							else {
								if (type !== 'users' && request.guild !== msg.guild) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.wrongGuild}`);
								else got.push(id);
							}
						}));
						collected.first().delete().catch(() => {});
						const endEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
						if (got.length > 0) endEmbed.addField(msg.language.finished, got.map(a => a));
						if (fail.length > 0) endEmbed.addField(msg.language.failed, fail.map(a => a));
						m.edit(endEmbed).catch(() => {});
						if (got.length > 0) {
							got.forEach(id => { 
								if (r[name[i]] && r[name[i]].includes(id)) {
									const index = r[name[i]].indexOf(id);
									r[name[i]].splice(index, 1);
								} else if (r[name[i]].length > 0) r[name[i]].push(id);
								else r[name[i]] = [id];
							});
							if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
							else msg.client.ch.query(`UPDATE antispamsettings SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
						}
					}
				} 
			}
		} else this.setup(msg);
	},
	async setup(msg) {

	},
	async notValid(msg, m, name) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.notValid)
			.addField(msg.lan.valid, msg.lan2[name].answers)
			.setFooter(msg.lan.pleaseRestart);
		msg.client.ch.reply(m, embed);

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