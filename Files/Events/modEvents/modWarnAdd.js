const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		let warnnr; 
		const em = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.constants.emotes.loading, lan.loading);
		const emMsg = await msg.client.ch.reply(msg, em);
		const member = await msg.client.ch.member(msg.guild, target);
		const exec = await msg.client.ch.member(msg.guild, executor);
		if (exec?.roles.highest.rawPosition < member?.roles.highest.rawPosition || exec?.roles.highest.rawPosition == member?.roles.highest.rawPosition) {
			em.setDescription(msg.client.constants.emotes.cross, lan.exeNoPerms);
			emMsg?.edit(em);
			return false;
		}
		const res = await msg.client.ch.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${target.id}';`);
		if (res && res.rowCount > 0) warnnr = res.rowCount+1;
		else warnnr = 1;
		const warnrnredo = await msg.client.ch.query(`SELECT * FROM warns WHERE userid = '${target.id}' AND guildid = '${msg.guild.id}';`);
		if (warnrnredo && warnrnredo.rowCount > 0) {
			for (let i = 0; i < warnrnredo.rowCount; i++) {
				let l = i;
				l++;
				await msg.client.ch.query(`UPDATE warns SET warnnr = '${l}' WHERE guildid = '${msg.guild.id}' AND userid = '${target.id}' AND dateofwarn = ${warnrnredo.rows[i].dateofwarn};`);
			}
		}
		msg.client.ch.query(`INSERT INTO warns (guildid, userid, reason, type, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername, msgurl) VALUES ('${msg.guild.id}', '${target.id}', '${reason.replace(/'/g, '')}', 'Warn', '${warnnr}', '${Date.now()}', '${msg.channel.id}', '${executor.id}', '${msg.channel.name.replace(/'/g, '')}', '${executor.username.replace(/'/g, '')}', '${msg.url}');`);
		const language = msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.warnAdd;
		const con = msg.client.constants.mod.warnAdd;
		const embed = new Discord.MessageEmbed()
			.setColor(con.color)
			.setDescription(msg.client.ch.stp(lan.reply, {user: msg.author, nr: warnnr}))
			.setTimestamp();
		msg.client.ch.reply(msg, embed);
		const warnEmbed = new Discord.MessageEmbed()
			.setTitle(msg.client.ch.stp(lan.DMtitle, {guild: msg.guild}))
			.setColor(con.color)
			.setDescription('```'+reason+'```')
			.setTimestamp();
		msg.client.ch.send(target, warnEmbed);
		const res2 = await msg.client.ch.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}';`);
		if (res && res2.rowCount > 0) {
			const logchannel = msg.client.channels.cache.get(res2.rows[0].modlogs);
			const WarnLogEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(lan.log.author, {target: target}), msg.client.ch.displayAvatarURL(target), msg.url)
				.setDescription(msg.client.ch.stp(lan.log.description, {target: target, user: executor}))
				.addField(language.reason, `\`\`\`${reason}\`\`\``)
				.setColor(con.color)
				.setTimestamp();
			if (logchannel) msg.client.ch.send(logchannel, WarnLogEmbed);
		}
		em.setDescription(msg.client.constants.emotes.tick, lan.success);
		emMsg?.edit(em);
		return true;
	}
};