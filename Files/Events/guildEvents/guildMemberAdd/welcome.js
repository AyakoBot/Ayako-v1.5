const Discord = require('discord.js');

module.exports = {
	async execute(member, user) {
		const client = user.client;
		const guild = member.guild;
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM welcome WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			if (r.enabledtof == true) {
				const channel = guild.channels.cache.get(r.channelid);
				if (channel && channel.id) { 
					if (!r.text) {
						const language = await ch.languageSelector(guild);
						r.text = ch.stp(language.guildMemberAddWelcome.welcome, {guild: guild});
					}
					r.text = r.text.replace(/%u205/g, '\'').replace(/%o205/g, '`').replace(/%i205/g, `${user}`);
					const embed = new Discord.MessageEmbed()
						.setDescription(`${r.text.toString()}`)
						.setColor(r.color.toUpperCase());
					if (r.imageurl !== null) {
						embed.setImage(`${r.imageurl}`);
					}
					if (r.pingrole) {
						const role = guild.roles.cache.get(r.pingrole);
						role.exists = role.id ? true : false;
						if (r.pingtof == true) {
							ch.send(channel, role.exists ? `${role}, ${user}` : `${user}`, embed).catch(() => {});
						} else {
							if (role.exists) ch.send(channel, `${role}`, embed);
							else ch.send(channel, embed).catch(() => {});
						}
					} else {
						if (r.pingtof == true) {
							ch.send(channel, `${user}`, embed).catch(() => {});
						} else {
							ch.send(channel, embed).catch(() => {});
						}
					}
				}
			}
		}
	}
};