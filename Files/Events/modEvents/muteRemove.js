const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.mod.muteRemove;
		const con = msg.client.constants.mod.muteRemove;
		const res = await msg.client.ch.query(`SELECT * FROM logchannels WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = msg.client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author, msg.client.ch.displayAvatarURL(executor), msg.constants.standard.invite)
					.setDescription(msg.client.ch.stp(lan.description, {user: executor, target: target}))
					.setTimestamp()
					.setThumbnail(msg.client.ch.displayAvatarURL(target))
					.addField(language.reason, `\`\`\`${reason}\`\`\``)
					.setFooter(msg.client.ch.stp(lan.footer, {user: executor, target: target}));
				msg.client.ch.send(logchannel, embed);
				const dmChannel = await target.createDM().catch(() => {});
				const DMembed = new Discord.MessageEmbed()
					.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
					.setColor(con.color)
					.setTimestamp()
					.setAuthor(lan.dm.author, lan.author.image, msg.client.ch.stp(lan.author.link), {guild: msg.guild});
				msg.client.ch.send(dmChannel, DMembed);
			}
		}
	}
};