const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		let mexisted = msg.m ? true : false;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.kickAdd;
		const con = msg.client.constants.mod.kickAdd;
		const em = new Discord.MessageEmbed()
			.setColor(con.color);
		if (mexisted) em.addField('\u200b', msg.client.constants.emotes.loading + ' ' + lan.loading);
		else em.setDescription(msg.client.constants.emotes.loading + ' ' + lan.loading);
		if (msg.m) await msg.m.edit({ embeds: [em] });
		else msg.m = await msg.client.ch.reply(msg, em);
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		if (!member) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.noMember);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMember);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (exec.roles.highest.rawPosition < member.roles.highest.rawPosition || exec.roles.highest.rawPosition == member.roles.highest.rawPosition) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.exeNoPerms);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		if (!member.kickable) {
			if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.permissionError);
			else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.permissionError);
			msg.m?.edit({ embeds: [em] });
			if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
			return false;
		}
		else {
			const dmChannel = await target.createDM().catch(() => {});
			const DMembed = new Discord.MessageEmbed()
				.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
				.setColor(con.color)
				.setTimestamp()
				.setAuthor(msg.client.ch.stp(lan.dm.author, {guild: msg.guild}), 
					lan.author.image, 
					msg.client.ch.stp(con.author.link, { guild: msg.guild }));
			const m = msg.client.ch.send(dmChannel, DMembed);
			let err;
			const kick = await member.kick(reason).catch((e) => {err = e;});
			if (kick) {
				const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
				let logchannel;
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
			} else if (!member) {
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + ' ' + lan.noMember);
				else em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMember);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			} else {
				m?.delete().catch(()  => {});
				if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.cross + lan.error + ` \`\`\`${err}\`\`\``);
				else em.setDescription(msg.client.constants.emotes.cross + lan.error + ` \`\`\`${err}\`\`\``);
				msg.m?.edit({ embeds: [em] });
				if (mexisted) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
				return false;
			}
		}
		if (mexisted) em.fields.pop(), em.addField('\u200b', msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		else em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		msg.m?.edit({embeds: [em]});
		return true;
	}
};