const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg, duration) {
		msg.m ? msg.m = await msg.m.fetch() : null;
		let mexisted = msg.m ? true : false;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.tempbanAdd;
		const con = msg.client.constants.mod.tempbanAdd;
		const now = Date.now();
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
		if (msg.id) {
			if (mexisted) await msg.m.edit({ embeds: [em] });
			else msg.m = await msg.client.ch.reply(msg, em);
			const member = await msg.guild.members.fetch(target.id).catch(() => { });
			const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
			if (exec?.roles.highest.rawPosition <= member?.roles.highest.rawPosition) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			if (executor.id == target.id) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.selfBan);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.selfBan);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			if (target.id == msg.client.user.id) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.meBan);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.meBan);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			if (member?.bannable == false) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.permissionError);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.permissionError);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			const banned = await msg.guild.bans.fetch(target).catch(() => { });
			if (banned) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + msg.client.ch.stp(lan.alreadyBanned, { target: target }));
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + msg.client.ch.stp(lan.alreadyBanned, { target: target }));
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
		}
		const dmChannel = await target.createDM().catch(() => { });
		const DMembed = new Discord.MessageEmbed()
			.setDescription(`${language.reason}: \n${reason}`)
			.setColor(con.color)
			.setTimestamp()
			.setAuthor(msg.client.ch.stp(lan.dm.author, { guild: msg.guild }), lan.author.image, msg.client.ch.stp(con.author.link, { guild: msg.guild }));
		const m = await msg.client.ch.send(dmChannel, DMembed);
		let err;
		const ban = await msg.guild.members.ban(target, { reason: reason, days: 1 }).catch((e) => { err = e; });
		if (ban) {
			await msg.client.ch.query(`
				INSERT INTO warns
                (guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`, 
			[msg.guild.id, target.id, reason, 'Ban', now + +duration, false, now, msg.channel.id, executor.id, msg.channel.name, msg.author.username]);
			const embed = new Discord.MessageEmbed()
				.setColor(con.color)
				.setAuthor(msg.client.ch.stp(lan.author, { user: target }), msg.client.ch.displayAvatarURL(target), msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(lan.description, { user: executor, target: target }))
				.setTimestamp()
				.addField(language.reason, `${reason}`)
				.setFooter(msg.client.ch.stp(lan.footer, { user: executor, target: target }));
			if (msg.logchannels) msg.client.ch.send(msg.logchannels, embed);
		} else {
			m?.delete().catch(() => { });
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + lan.error + ` ${msg.client.ch.makeCodeBlock(err)}`);
			else em.setDescription(msg.client.constants.emotes.cross + lan.error + ` ${msg.client.ch.makeCodeBlock(err)}`);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		else em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		const res2 = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2 AND dateofwarn = $3;', [msg.guild.id, target.id, now]);
		await msg.m?.edit({ embeds: [em] });
		if (res2 && res2.rowCount > 0) {
			msg.r = res2.rows[0];
			msg.client.bans.set(`${msg.guild.id}-${target.id}`, setTimeout(() => msg.client.emit('modBanRemove', msg.client.user, target, language.ready.unmute.reason, msg), duration));
			if (msg.source) msg.client.emit('modSourceHandler', msg);
			return true;
		} else return false;
	}
};