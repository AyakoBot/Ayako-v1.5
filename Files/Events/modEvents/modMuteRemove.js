const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.muteRemove;
		const con = msg.client.constants.mod.muteRemove;
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading + ' ' +lan.loading);
		if (msg.m) await msg.m.edit({ embeds: [em] });
		else msg.m = await msg.client.ch.reply(msg, em);
		let logchannel;
		let role;
		const resM = await msg.client.ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
		if (resM && resM.rowCount > 0) role = msg.guild.roles.cache.get(resM.rows[0].muteroleid);
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		const memberClient = msg.guild.me;
		if (!member) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.noMember);
			msg.m?.edit({ embeds: [em] });
			return false;
		}
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.exeNoPerms);
			msg.m?.edit({embeds: [em]});
			return false;
		}
		if ((memberClient.roles.highest.rawPosition < member?.roles.highest.rawPosition || memberClient.roles.highest.rawPosition == member?.roles.highest.rawPosition) || !memberClient.permissions.has(268435456)) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' + lan.meNoPerms);
			msg.m?.edit({ embeds: [em] });
			return false;
		}
		if (role) {
			if (!member?.roles.cache.has(role.id)) {
				em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.hasNoRole);
				msg.m?.edit({embeds: [em]});
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
		msg.client.ch.query('UPDATE warns SET closed = true WHERE dateofwarn = $1 AND guildid = $2 AND userid = $3;', [msg.r.dateofwarn, msg.guild.id, target.id]);
		return true;
	}
};