const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(invite) {
		const client = invite.client;
		const ch = client.ch;
		const Constants = client.constants;
		const guild = invite.guild;
		client.invites.set(guild.id, invite);
		const language = await ch.languageSelector(guild);
		const lan = language.inviteCreate;
		const con = Constants.inviteCreate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.inviteEvents);
			if (logchannel && logchannel.id) {
				const audits = await invite.guild.fetchAuditLogs({limit: 10, type: 40});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter((a) => a.target && (a.target.code == invite.code));
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				let link = invite.url;
				if (invite.inviter) link = ch.stp(con.author.link, {user: invite.inviter});
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.name, con.author.image, link)
					.setColor(con.color)
					.setTimestamp();
				if (entry) {
					embed.setDescription(ch.stp(lan.description, {user: entry.executor}));
					if (entry.reason) embed.addField(language.reason, entry.reason);
				} else {
					if (invite.inviter) embed.setDescription(ch.stp(lan.description, {user: invite.inviter}));
					else embed.setDescription(lan.descriptionNoUser);
				}
				if (invite.channel) embed.addField(lan.channel, `${invite.channel} / \`${invite.channel.name}\` / \`${invite.channel.id}\``, false);
				if (invite.expiresTimestamp) embed.addField(lan.expires, `\`${new Date(invite.expiresTimestamp).toUTCString()}\`\n(\`${ch.stp(language.time.timeIn, {time: moment.duration(Date.now() - invite.expiresTimestamp).format(`Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`)})}\`)`, false);
				if (invite.maxAge) embed.addField(lan.age, moment.duration(invite.maxAge * 1000).format(`Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`), true);
				if (invite.maxUses) embed.addField(lan.uses, invite.maxUses, true);
				if (invite.targetUser) embed.addField(lan.targetedUser, `${invite.targetUser} / \`${invite.targetUser.username}\` / \`${invite.targetUser.id}\``, true);
				if (invite.url) embed.addField(lan.url, `${invite.url}`, true);
				ch.send(logchannel, embed);
			}
		}
	}
};