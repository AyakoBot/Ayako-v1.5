const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(member) {
		const client = member.client;
		const user = await client.users.fetch(member.id);
		const guild = member.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.guildMemberRemove;
		const con = Constants.guildMemberRemove;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			let audit = await guild.fetchAuditLogs({limit: 5, type: 20}).catch(() => {});	
			let entry;
			if (audit && audit.entries) {
				audit = audit.entries.filter((e) => e.target.id == user.id);
				entry = audit.sort((a,b) => b.id - a.id);
				entry = entry.first();
			}
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setThumbnail(ch.displayAvatarURL(user))
					.setTimestamp();
				const roles = member.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition);
				const letters = 27 * roles.size;
				const maxFieldSize = 1024;
				if (roles.size > 0) {
					if (letters > maxFieldSize) {
						const chunks = chunker(roles, 37);
						for (let i = 0; i < chunks.length; i++) {
							if (i == 0) embed.addField(language.roles, chunks[i]);
							else embed.addField('\u200b', chunks[i]);
						}
					} else {
						const rolemap = roles.map(r => `${r}`).join(' | ');
						embed.addField(language.roles, rolemap);
					}
				}
				if (entry && entry.id && (+ch.getUnix(entry.id) > (Date.now() - 1000))) {
					embed
						.setDescription(ch.stp(lan.descriptionKicked, {user: entry.executor, target: entry.target}))
						.setAuthor(lan.author.nameKick, con.author.kickImage, ch.stp(con.author.link, {user: user}));
				} else {
					embed
						.setDescription(ch.stp(lan.descriptionLeft, {user: user}))
						.setAuthor(lan.author.nameLeave, con.author.leaveImage, ch.stp(con.author.link, {user: user}));
				}
				embed.addField(language.joinedAt, `\`${new Date(member.joinedTimestamp).toUTCString()}\`\n(\`${ch.stp(language.time.timeAgo, {time: moment.duration(Date.now() - member.joinedTimestamp).format(`Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`)})}\`)`);
				ch.send(logchannel, embed);
			}
		}
	}
};

function chunker(arr, len) {
	let chunks = [];
	let i = 0;
	while (i < arr.length) {
		chunks.push(arr.slice(i, i += len));
	}
	chunks = chunks.map(o => o);
	return chunks;
}
