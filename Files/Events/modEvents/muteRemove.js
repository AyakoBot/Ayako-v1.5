const { client } = require('../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, guild, reason) {
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.mod.muteRemove;
		const con = Constants.mod.muteRemove;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author, ch.displayAvatarURL(executor), Constants.standard.invite)
					.setDescription(ch.stp(lan.description, {user: executor, target: target}))
					.setTimestamp()
					.setThumbnail(ch.displayAvatarURL(target))
					.addField(language.reason, `\`\`\`${reason}\`\`\``)
					.setFooter(ch.stp(lan.footer, {user: executor, target: target}));
				ch.send(logchannel, embed);
				const dmChannel = await target.createDM().catch(() => {});
				const DMembed = new Discord.MessageEmbed()
					.setDescription(`${language.reason}: \`\`\`${reason}\`\`\``)
					.setColor(con.color)
					.setTimestamp()
					.setAuthor(lan.dm.author, lan.author.image, ch.stp(lan.author.link), {guild: guild});
				ch.send(dmChannel, DMembed);
			}
		}
	}
};