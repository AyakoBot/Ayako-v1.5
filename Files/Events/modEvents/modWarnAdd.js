const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		let warnnr; 
		const con = msg.client.constants.mod.warnAdd;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.warnAdd;
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading + ' ' +lan.loading);
		const emMsg = await msg.client.ch.reply(msg, em);
		const member = await msg.guild.members.fetch(target.id).catch(() => { });
		const exec = await msg.guild.members.fetch(executor.id).catch(() => { });
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross + ' ' +lan.exeNoPerms);
			emMsg?.edit({embeds: [em]});
			return false;
		}
		const res = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2;', [msg.guild.id, target.id]);
		if (res && res.rowCount > 0) warnnr = res.rowCount+1;
		else warnnr = 1;
		msg.client.ch.query('INSERT INTO warns (guildid, userid, reason, type, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername, msgurl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);', [msg.guild.id, target.id, reason, 'Warn', Date.now(), msg.channel.id, executor.id, msg.channel.name, executor.username, msg.url]);
		const warnEmbed = new Discord.MessageEmbed()
			.setTitle(msg.client.ch.stp(lan.DMtitle, {guild: msg.guild}))
			.setColor(con.color)
			.setDescription('```'+reason+'```')
			.setTimestamp();
		msg.client.ch.send(target, warnEmbed);
		const res2 = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
		if (res2 && res2.rowCount > 0) {
			const logchannel = msg.client.channels.cache.get(res2.rows[0].modlogs);
			const WarnLogEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(lan.log.author, {target: target}), msg.client.ch.displayAvatarURL(target), msg.url)
				.setDescription(msg.client.ch.stp(lan.log.description, {target: target, user: executor}))
				.addField(language.reason, `\`\`\`${reason}\`\`\``)
				.setColor(con.color)
				.setTimestamp();
			if (logchannel) msg.client.ch.send(logchannel, WarnLogEmbed);
		}
		em.setDescription(msg.client.constants.emotes.tick + ' ' + msg.client.ch.stp(lan.reply, { user: target, nr: warnnr }));
		emMsg?.edit({embeds: [em]});
		return true;
	}
};