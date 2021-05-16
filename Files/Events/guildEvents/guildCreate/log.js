const { client } = require('../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(guild) {
		const ch = client.ch;
		const Constants = client.constants;
		const con = Constants.guildCreate;
		const logEmbed = new Discord.MessageEmbed()
			.setDescription(con.logEmbed.joinedAGuild)
			.addField(con.logEmbed.guildName, guild.name, true)
			.addField(con.logEmbed.guildId, guild.id, true)
			.addField(con.logEmbed.memberCount, guild.memberCount, true)
			.addField(con.logEmbed.guildOwner, guild.ownerID, true)
			.setFooter(ch.stp(con.logEmbed.currentGuildCount, {client: client}))
			.setColor(con.logEmbed.color);
		ch.send(client.channels.cache.get(Constants.standard.guildLogChannel), logEmbed);
	}
};