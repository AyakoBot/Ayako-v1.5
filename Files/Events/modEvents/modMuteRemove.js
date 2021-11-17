const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		msg.m ? msg.m = await msg.m.fetch() : null;
		let mexisted = msg.m ? true : false;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.muteRemove;
		const con = msg.client.constants.mod.muteRemove;
		let em;
		if (mexisted) {
			em = new Discord.MessageEmbed(msg.m.embeds[0])
				.setColor(con.color)
				.addField('\u200b', msg.client.constants.emotes.loading + ' ' + lan.loading);
		} else {
			em = new Discord.MessageEmbed()
				.setColor(con.color)
				.setDescription(msg.client.constants.emotes.loading + ' ' + lan.loading);
		}
		if (mexisted) await msg.m.edit({ embeds: [em] });
		else msg.m = await msg.client.ch.reply(msg, em);
		let logchannel;
		let role;
		const resM = await msg.client.ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
		if (resM && resM.rowCount > 0) role = msg.guild.roles.cache.get(resM.rows[0].muteroleid);
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		const memberClient = msg.guild.me;
		if (!member) {
			if (mexisted) {
				em.fields.pop();
				em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.noMember);
				msg.m?.edit({ embeds: [em] });
			}
			else {
				em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMemberHint);
				const Yes = new Discord.MessageButton()
					.setCustomId('yes')
					.setLabel(msg.language.Yes)
					.setStyle('SUCCESS');
				const No = new Discord.MessageButton()
					.setCustomId('no')
					.setLabel(msg.language.No)
					.setStyle('DANGER');
				msg.m?.edit({ embeds: [em], components: msg.client.ch.buttonRower([[Yes, No]]) });
			}
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			else {
				const [aborted, answer] = await ask(executor, msg);
				if (aborted) {
					em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMember);
					answer ? answer.update({ embeds: [em], components: [] }) : msg.m?.edit({ embeds: [em], components: [] });
					return false;
				} else return assingWarn(executor, target, reason, msg, answer, em, language, con, lan, logchannel);
			}
		}
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if ((memberClient.roles.highest.rawPosition < member?.roles.highest.rawPosition || memberClient.roles.highest.rawPosition == member?.roles.highest.rawPosition) || !memberClient.permissions.has(268435456)) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.meNoPerms);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.meNoPerms);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (role) {
			if (!member?.roles.cache.has(role.id)) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.hasNoRole);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.hasNoRole);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			let err;

			const unmute = await msg.guild.members.cache.get(target.id).roles.remove(role).catch(() => {});
			if (unmute) {
				const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
				if (res && res.rowCount > 0) logchannel = msg.client.channels.cache.get(res.rows[0].guildEvents);
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author, msg.client.ch.displayAvatarURL(executor), msg.client.constants.standard.invite)
					.setDescription(msg.client.ch.stp(lan.description, {user: executor, target: target}))
					.setTimestamp()
					.setThumbnail(msg.client.ch.displayAvatarURL(target))
					.addField(language.reason, `\`\`\`${reason}\`\`\``)
					.setFooter(msg.client.ch.stp(lan.footer, {user: executor, target: target}));
				if (logchannel) msg.client.ch.send(logchannel, embed);
				const dmChannel = await target.createDM().catch(() => {});
				const DMembed = new Discord.MessageEmbed()
					.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
					.setColor(con.color)
					.setTimestamp()
					.setAuthor(msg.client.ch.stp(lan.dm.author, { guild: msg.guild }), lan.author.image, msg.client.ch.stp(con.author.link, { guild: msg.guild }));
				msg.client.ch.send(dmChannel, DMembed);
			} else {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + lan.error + ` \`\`\`${err}\`\`\``);
				else em.setDescription(msg.client.constants.emotes.cross + lan.error + ` \`\`\`${err}\`\`\``);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
		} else {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.noRole);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noRole);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		else em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		await msg.m?.edit({embeds: [em]});
		await msg.client.ch.query('UPDATE warns SET closed = true WHERE dateofwarn = $1 AND guildid = $2 AND userid = $3;', [msg.r.dateofwarn, msg.guild.id, target.id]);
		if (msg.source) msg.client.emit('modSourceHandler', msg);
		return true;
	}
};

async function ask(executor, msg) {
	if (!msg.m) return [true];
	else {
		const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
		const resolved = new Promise((resolve) => {
			buttonsCollector.on('collect', async (button) => {
				if (button.user.id !== executor.id) return msg.client.ch.notYours(button, msg.m);
				if (button.customId == 'yes') {
					buttonsCollector.stop();
					resolve([false, button]);
				} else if (button.customId == 'no') {
					buttonsCollector.stop();
					resolve([true, button]);
				}
			});
			buttonsCollector.on('end', (col, reason) => {
				if (reason == 'time') {
					msg.client.ch.collectorEnd(msg);
					resolve([true]);
				}
			});
		});
		return resolved;
	}
}

async function assingWarn(executor, target, reason, msg, answer, em, language, con, lan, logchannel) {
	const dmChannel = await target.createDM().catch(() => { });
	const DMembed = new Discord.MessageEmbed()
		.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
		.setColor(con.color)
		.setTimestamp()
		.setAuthor(msg.client.ch.stp(lan.dm.author, { guild: msg.guild }), lan.author.image, msg.client.ch.stp(con.author.link, { guild: msg.guild }));
	msg.client.ch.send(dmChannel, DMembed);
	const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
	if (res && res.rowCount > 0) logchannel = msg.client.channels.cache.get(res.rows[0].guildEvents);
	const embed = new Discord.MessageEmbed()
		.setColor(con.color)
		.setAuthor(lan.author, msg.client.ch.displayAvatarURL(executor), msg.client.constants.standard.invite)
		.setDescription(msg.client.ch.stp(lan.description, { user: executor, target: target }))
		.setTimestamp()
		.setThumbnail(msg.client.ch.displayAvatarURL(target))
		.addField(language.reason, `\`\`\`${reason}\`\`\``)
		.setFooter(msg.client.ch.stp(lan.footer, { user: executor, target: target }));
	if (logchannel) msg.client.ch.send(logchannel, embed);
	em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
	await answer.update({ embeds: [em], components: [] }).catch(() => { });
	return true;
}