const Discord = require('discord.js');

module.exports = {
	async execute(guild) {
		const Constants = guild.client.constants;
		const ch = guild.client.ch;
		const language = await guild.client.ch.languageSelector(guild);
		const lan = language.guildCreate;
		const joinembed = new Discord.MessageEmbed()
			.setAuthor(lan.author, Constants.standard.image, Constants.standard.invite)
			.setColor(guild.client.ch.member(guild, guild.client.user).displayHexColor())
			.addField(ch.stp(lan.fields.one.name, {prefix: Constants.standard.prefix}), lan.fields.one.value)
			.addField(ch.stp(lan.fields.two.name, {prefix: Constants.standard.prefix}), lan.fields.two.value)
			.addField(ch.stp(lan.fields.three.name, {prefix: Constants.standard.prefix}), lan.fields.three.value)
			.addField(ch.stp(lan.fields.four.name, {prefix: Constants.standard.prefix}), lan.fields.four.value)
			.addField(ch.stp(lan.fields.five.name, {prefix: Constants.standard.prefix}), lan.fields.five.value);
		const audits = await guild.fetchAuditLogs({limit: 3, type: 28});
		let entry;
		if (audits && audits.entries) {
			const audit = audits.entries.filter((a) => a.target.id == guild.client.user.id);
			entry = audit.sort((a,b) => b.id - a.id);
			entry = entry.first();
		}
		let sent = false;
		const textchannels = guild.channels.cache.filter((c) => c.type == 'text');
		const map = textchannels.map(x => x);
		if (entry && entry.id) {
			for (let i = 0; map.length > i; i++) {
				if (sent == true) return; 
				const m = await ch.send(map[i], `Thank you for adding me! ${entry.executor}`, joinembed);
				if (m && m.id) sent = true;
			}
		} else {
			for (let i = 0; map.length > i; i++) {
				if (sent == true) return; 
				const m = await ch.send(map[i], joinembed);
				if (m && m.id) sent = true;
			}
		}

	}
};