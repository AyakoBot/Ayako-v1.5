const Discord = require('discord.js');

module.exports = {
	async execute() {
		const client = require('../../../BaseClient/DiscordClient');
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM disboard;');
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rows.length; i++) {
				const role = `<@&${res.rows[i].role}>`;
				const lastbump = res.rows[i].lastbump;
				const enabled = res.rows[i].enabled;
				const guild = client.guilds.cache.get(res.rows[i].guildid);
				const channel = client.channels.cache.get(res.rows[i].channelid);
				if (!enabled) return;
				const timeLeft = lastbump - Date.now();
				if (guild && guild.id && channel && channel.id) {
					if (timeLeft <= 0) end(ch, guild, Constants, channel, role); 
					else setTimeout(() => end(ch, guild, Constants, channel, role), timeLeft);
				}

			}
		}

	}
};

async function end(ch, guild, Constants, channel, role) {
	const language = await ch.languageSelector(guild);
	const embed = new Discord.MessageEmbed()
		.setDescription(language.ready.disboard.bumpMsg)
		.setColor(Constants.standard.color)
		.setTimestamp()
		.setThumbnail(ch.iconURL(guild))
		.setAuthor(language.ready.disboard.title, Constants.standard.image, Constants.standard.invite);
	ch.send(channel, role, embed);
	ch.query('UPDATE disboard SET channelid = null, lastbump = NULL WHERE guildid = $1;', [guild.id]);
}