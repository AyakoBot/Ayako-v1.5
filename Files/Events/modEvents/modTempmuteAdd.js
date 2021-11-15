const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg, duration) {
		let mexisted = msg.m ? true : false;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.tempmuteAdd;
		const con = msg.client.constants.mod.tempmuteAdd;
		const now = Date.now();
		const em = new Discord.MessageEmbed()
			.setColor(con.color);
		if (mexisted) em.addField('\u200b', msg.client.constants.emotes.loading + ' ' + lan.loading);
		else em.setDescription(msg.client.constants.emotes.loading + ' ' + lan.loading);		
		if (msg.m) await msg.m.edit({ embeds: [em] });
		else msg.m = await msg.client.ch.reply(msg, em);
		let role;
		let logchannel;
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		const memberClient = msg.guild.me;
		if (!member) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.noMember);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMember);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		const resM = await msg.client.ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
		if (resM && resM.rowCount > 0) role = msg.guild.roles.cache.get(resM.rows[0].muteroleid);
		if ((memberClient.roles.highest.rawPosition < member?.roles.highest.rawPosition || memberClient.roles.highest.rawPosition == member?.roles.highest.rawPosition) || !memberClient.permissions.has(268435456)) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.meNoPerms);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.meNoPerms);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (role) {
			if (member?.roles.cache.has(role.id)) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.hasRole);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.hasRole);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
			let err;
			const Mute = await msg.guild.members.cache.get(target.id).roles.add(role).catch(() => {});
			if (Mute) {
				await msg.client.ch.query(`
				INSERT INTO warns 
				(guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES 
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`, 
				[msg.guild.id, target.id, reason, 'Mute', now + +duration, false, now, msg.channel.id, executor.id, msg.channel.name, msg.author.username]);
				const dmChannel = await target.createDM().catch(() => {});
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
					.setDescription(msg.client.ch.stp(lan.description, {user: executor, target: target}))
					.setTimestamp()
					.setThumbnail(msg.client.ch.displayAvatarURL(target))
					.addField(language.reason, `\`\`\`${reason}\`\`\``)
					.setFooter(msg.client.ch.stp(lan.footer, {user: executor, target: target}));
				if (logchannel) msg.client.ch.send(logchannel, embed);
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
		let warnnr;
		const res = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2;', [msg.guild.id, target.id]);
		if (res && res.rowCount > 0) warnnr = res.rowCount + 1;
		else warnnr = 1;
		if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target, nr: warnnr }));
		else em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target, nr: warnnr }));
		msg.m?.edit({ embeds: [em] });
		const res2 = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2 AND dateofwarn = $3;', [msg.guild.id, target.id, now]);
		if (res2 && res2.rowCount > 0) {
			msg.r = res2.rows[0];
			msg.client.mutes.set(`${msg.guild.id}-${target.id}`, setTimeout(() => msg.client.emit('modMuteRemove', msg.client.user, target, language.ready.unmute.reason, msg), duration));
			return true;
		} else return false;
	}
};