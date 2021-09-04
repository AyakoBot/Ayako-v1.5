const Discord = require('discord.js');

module.exports = {
	async execute() {
		const { client } = require('../../../BaseClient/DiscordClient');
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM reminders;');
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rows.length; i++) {
				const text = res.rows[i].text;
				const duration = res.rows[i].duration;
				const channel = client.channels.cache.get(res.rows[i].channelid);
				if (channel && channel.id) {
					const guild = channel.guild;
					const user = await client.users.fetch(res.rows[i].userid);
					if (duration < Date.now()) {
						if (user && user.id) {
							if (guild && guild.id) {
								const member = await guild.members.fetch(user.id);
								if (member) {
									const language = await ch.languageSelector(guild);
									const embed = new Discord.MessageEmbed()
										.setDescription(`${language.ready.reminder.description}\`\`\`${text}\`\`\``)
										.setColor(guild.me.displayHexColor)
										.setTimestamp();
									const m = await ch.send(channel, `${user}`, embed);
									if (!m || !m.id) ch.send(user, ch.stp(language.ready.reminder.failedMsg, {channel: channel}), embed);
									ch.query('DELETE FROM reminders WHERE userid = $1 AND duration = $2;', [user.id, duration]);
								} else {
									const language = await ch.languageSelector('en');
									const embed = new Discord.MessageEmbed()
										.setDescription(`${language.ready.reminder.description}\`\`\`${text}\`\`\``)
										.setColor(guild.me.displayHexColor)
										.setTimestamp();
									ch.send(user, embed);
									ch.query('DELETE FROM reminders WHERE userid = $1 AND duration = $2;', [user.id, duration]);
								}
							}
						}
					}
				}
			} 
		}
		const res2 = await ch.query('SELECT * FROM reminders;');
		if (res2 && res2.rowCount > 0) {
			for (let i = 0; i < res2.rows.length; i++) {
				const text = res.rows[i].text;
				const duration = res.rows[i].duration;
				const channel = res.rows[i].channelid;
				const user = res.rows[i].userid;
				await ch.query('UPDATE reminders SET rnr = $1 WHERE text = $2 AND duration = $3 AND channelid = $4 and user = $5;', [i, text, duration, channel, user]);
			}
		}

	}
};