const Discord = require('discord.js');

module.exports = {
	async execute(role) {
		const client = role.client;
		const guild = role.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.roleCreate;
		const con = Constants.roleCreate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.roleEvents);
			if (logchannel && logchannel.id) {
				const audits = await guild.fetchAuditLogs({limit: 3, type: 30});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter((a) => a.target.id == role.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.setAuthor(lan.author.name, con.author.image)
					.setColor(con.color);
				if (entry) embed.setDescription(ch.stp(lan.descriptionWithAudit, {user: entry.executor, role: role}));
				else if (guild.members.cache.find(m => m.user.bot && (m.user.username == role.name)) && role.managed) embed.setDescription(ch.stp(lan.descriptionAutorole, {user: guild.members.cache.find(m => m.user.bot && (m.user.username == role.name)).user, role: role}));
				else embed.setDescription(ch.stp(lan.descriptionWithoutAudit, {role: role}));
				ch.send(logchannel, embed);
			}
		}
	}
};