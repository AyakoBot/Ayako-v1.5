const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		let warnnr; 
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
		const embed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.mod.banAdd.color)
			.setDescription(msg.client.ch.stp(language.mod.banAdd.reply, {user: msg.author, nr: warnnr}))
			.setTimestamp();
		msg.client.ch.reply(msg, embed);
		const warnEmbed = new Discord.MessageEmbed()
			.setTitle(msg.client.ch.stp(language.mod.warnAdd.DMtitle, {guild: msg.guild}))
			.setColor(msg.client.constants.mod.warnAdd.color)
			.setDescription('```'+reason+'```')
			.setTimestamp();
		msg.client.ch.send(target, warnEmbed);
		let logchannelid = '';
		const res2 = await msg.client.ch.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}';`);
		if (res && res2.rowCount > 0) logchannelid = res2.rows[0].modlogs;
		const logchannel = msg.client.channels.cache.get(logchannelid);
		const WarnLogEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(language.mod.warnAdd.log.author, {target: target}), msg.client.ch.displayAvatarURL(target), msg.url)
			.setDescription(msg.client.ch.stp())
			.addField(language.reason, `\`\`\`${reason}\`\`\``)
			.setColor(msg.client.constants.mod.warnAdd.color)
			.setTimestamp();
		if (logchannel) msg.client.ch.send(logchannel, WarnLogEmbed);
	}
};