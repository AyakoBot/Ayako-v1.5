const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		const guild = msg.guild;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.messageEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const con = Constants.messageReactionRemoveAll;
				const lan = language.messageReactionRemoveAll;
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setAuthor(lan.author.name, con.author.image, con.author.link)
					.setTimestamp()
					.setDescription(ch.stp(lan.description, {link: ch.stp(con.author.link, {msg: msg})}));
				ch.send(logchannel, embed);
			}
		}
	}
};