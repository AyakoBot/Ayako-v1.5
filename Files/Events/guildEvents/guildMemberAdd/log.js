const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(member, user) {
		const client = user.client;
		const guild = member.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.guildMemberAddLog;
		const con = Constants.guildMemberAddLog;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.addField(language.createdAt, `\`${new Date(user.createdTimestamp).toUTCString()}\`\n(\`${ch.stp(language.time.timeAgo, {time: moment.duration(Date.now() - user.createdTimestamp).format(`Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`)})}\`)`)
					.setColor(con.color);
				const cachedInvites = client.invites.get(guild.id);
				if (user.bot) {
					const audits = await guild.fetchAuditLogs({limit: 3, type: 28});
					let entry;
					if (audits && audits.entries) {
						const audit = audits.entries.filter((a) => a.target.id == user.id);
						entry = audit.sort((a,b) => b.id - a.id);
						entry = entry.first();
					}
					embed.setAuthor(lan.author.titleBot, con.author.image, ch.stp(con.author.link, {user: user}));
					embed.setThumbnail(ch.displayAvatarURL(user));
					if (entry) {
						embed.setDescription(ch.stp(lan.descriptionBot, {user: entry.executor, bot: user}));
					} else {
						embed.setDescription(ch.stp(lan.descriptionBotNoAudit, {bot: user}));
					}
				} else {
					const newInvites = await guild.invites.fetch();
					client.invites.set(guild.id, newInvites);
					let usedInvite;
					if (cachedInvites) usedInvite = newInvites.find(inv => cachedInvites.find(i => i.code == inv.code).uses < inv.uses);
					embed.setAuthor(lan.author.titleUser, con.author.image, ch.stp(con.author.link, {user: user}));
					embed.setThumbnail(ch.displayAvatarURL(member.user));
					embed.setDescription(ch.stp(lan.descriptionUser, {user: user}));
					if (usedInvite) {
						if (usedInvite.uses) embed.addField(lan.inviteInfoTitle, ch.stp(lan.inviteInfoUses, {invite: usedInvite}));
						else embed.addField(lan.inviteInfoTitle, ch.stp(lan.inviteInfo, {invite: usedInvite}));
					}
				}
				ch.send(logchannel, embed);
			}
		}
	}
};