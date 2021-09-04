const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.muteRemove;
		const con = msg.client.constants.mod.muteRemove;
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading, lan.loading);
		const emMsg = await msg.client.ch.reply(msg, em);
		let logchannel;
		let role;
		const member = await msg.guild.members.fetch(target.id);
		const exec = await msg.guild.members.fetch(executor.id);
		const memberClient = msg.guild.me;
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross, lan.exeNoPerms);
			emMsg?.edit(em);
			return false;
		}
		const resM = await msg.client.ch.query('SELECT * FROM muterole WHERE guildid = $1;', [msg.guild.id]);
		if (resM && resM.rowCount > 0) role = msg.roles.cache.get(resM.rows[0].muteroleid);
		if (role) {
			if (!member.roles.cache.has(role.id)) {
				em.setDescription(msg.client.constants.emotes.cross, lan.hasNoRole);
				emMsg?.edit(em);
				return false;
			}
			let err;
			const unmute = await target.roles.add(role).catch(() => {});
			if (unmute) {
				if ((memberClient.roles.highest.rawPosition < member.roles.highest.rawPosition || memberClient.roles.highest.rawPosition == member.roles.highest.rawPosition) || !memberClient.permissions.has(268435456)) return msg.client.ch.reply(msg, lan.meNoPerms);
				const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
				if (res && res.rowCount > 0) logchannel = msg.client.channels.cache.get(res.rows[0].guildEvents);
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author, msg.client.ch.displayAvatarURL(executor), msg.constants.standard.invite)
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
					.setAuthor(msg.client.ch.stp(lan.dm.author, {guild: msg.guild}), lan.author.image, msg.client.ch.stp(lan.author.link), {guild: msg.guild});
				msg.client.ch.send(dmChannel, DMembed);
			} else {
				em.setDescription(msg.client.constants.emotes.cross, lan.error+` \`\`\`${err}\`\`\``);
				emMsg?.edit(em);
				return false;
			}
		} else {
			em.setDescription(msg.client.constants.emotes.cross, lan.noRole);
			emMsg?.edit(em);
			return false;
		}
		em.setDescription(msg.client.constants.emotes.tick, lan.success);
		emMsg?.edit(em);
		return true;
	}
};