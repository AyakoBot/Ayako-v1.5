const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Discord = require('discord.js');
const Constants = require('../../Constants.json');

module.exports = {
	async execute(guild) {
		const con = Constants.guildDelete;
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