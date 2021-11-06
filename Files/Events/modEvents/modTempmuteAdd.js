const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg, duration) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.tempmuteAdd;
		const con = msg.client.constants.mod.tempmuteAdd;
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading + ' ' +lan.loading);
		if (msg.m) await msg.m.edit({ embeds: [em] });
		else msg.m = await msg.client.ch.reply(msg, em);
		let role;
		let logchannel;
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		const memberClient = msg.guild.me;
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.exeNoPerms);
			msg.m?.edit({embeds: [em]});
			return false;
		}
		const resM = await msg.client.ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
		if (resM && resM.rowCount > 0) role = msg.guild.roles.cache.get(resM.rows[0].muteroleid);
		if ((memberClient.roles.highest.rawPosition < member.roles.highest.rawPosition || memberClient.roles.highest.rawPosition == member.roles.highest.rawPosition) || !memberClient.permissions.has(268435456)) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.meNoPerms);
			msg.m?.edit({embeds: [em]});
			return false;
		}
		if (role) {
			if (member.roles.cache.has(role.id)) {
				em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.hasRole);
				msg.m?.edit({embeds: [em]});
				return false;
			}
			let err;
			const Mute = await msg.guild.members.cache.get(target.id).roles.add(role).catch(() => {});
			if (Mute) {
				msg.client.ch.query(`
				INSERT INTO warns 
				(guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES 
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`, 
				[msg.guild.id, target.id, reason, 'Mute', Date.now() + +duration, false, Date.now(), msg.channel.id, executor.id, msg.channel.name, msg.author.username]);
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
				em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.error+` \`\`\`${err}\`\`\``);
				msg.m?.edit({embeds: [em]});
				return false;
			}
		} else {
			em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.noRole);
			msg.m?.edit({embeds: [em]});
			return false;
		}
		em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.success, { target: target }));
		msg.m?.edit({embeds: [em]});
		return true;
	}
};