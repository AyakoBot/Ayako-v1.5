const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Discord = require('discord.js');
const Constants = require('../../Constants.json');

module.exports = {
	async execute(guild) {
		const language = await ch.languageSelector(guild);
		const lan = language.guildCreate;
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

		const joinembed2 = new Discord.MessageEmbed()
			.setAuthor(lan.author, Constants.standard.image, Constants.standard.invite)
			.setColor(Constants.standard.color)
			.addField(ch.stp(lan.fields.one.name, {prefix: Constants.standard.prefix}), lan.fields.one.value)
			.addField(ch.stp(lan.fields.two.name, {prefix: Constants.standard.prefix}), lan.fields.two.value)
			.addField(ch.stp(lan.fields.three.name, {prefix: Constants.standard.prefix}), lan.fields.three.value)
			.addField(ch.stp(lan.fields.four.name, {prefix: Constants.standard.prefix}), lan.fields.four.value)
			.addField(ch.stp(lan.fields.five.name, {prefix: Constants.standard.prefix}), lan.fields.five.value);
		
		const audits = await guild.fetchAuditLogs({limit: 3, type: 28});
		let entry;
		if (audits && audits.entries) {
			const audit = audits.entries.filter((a) => a.target.id == client.user.id);
			entry = audit.sort((a,b) => b.id - a.id);
			entry = entry.first();
		}
		let sent = false;
		const textchannels = guild.channels.cache.filter((c) => c.type == 'text');
		const map = textchannels.map(x => x);
		if (entry && entry.id) {
			for (let i = 0; map.length > i; i++) {
				if (sent == true) return; 
				const m = await ch.send(map[i], `Thank you for adding me! ${entry.executor}`, joinembed2);
				if (m && m.id) sent = true;
			}
		} else {
			for (let i = 0; map.length > i; i++) {
				if (sent == true) return; 
				const m = await ch.send(map[i], joinembed2);
				if (m && m.id) sent = true;
			}
		}
		setTimeout(() => {
			const role = guild.roles.cache.find(role => role.name === Constants.standard.color);
			if (role && role.id) {
				role.edit({ color: con.logEmbed.color }).catch(() => {});
			}
		}, 600000);
	}
};