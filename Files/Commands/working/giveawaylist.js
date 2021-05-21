const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	name: 'giveawaylist',
	Category: 'Giveaway',
	description: 'List all Giveaways on your server',
	usage: 'h!giveawaylist',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		const res = await pool.query(`SELECT * FROM giveawaysettings WHERE guildid = '${msg.guild.id}'`);
		if (res) {
			if (res.rows[0]) {
				const embed = new Discord.MessageEmbed()
					.setAuthor('All Giveaways on '+msg.guild.name, 'https://ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
					.setColor('#b0ff00');
				await res.rows.forEach(async (row) => {
					const r = row;
					const channel = client.channels.cache.get(r.channelid);
					const m = await channel.messages.fetch(r.messageid);
					const reactions = m.reactions.cache.find(r => r.emoji.name === '🎉');
					embed.addField(`\`\`\`${r.description}\`\`\`\n\`Participants: ${reactions.count--}\``, `[Giveaway](https://discord.com/channels/${r.guildid}/${r.channelid}/${r.messageid} "Click here to get to the Giveaway")\nEnds in: ${r.ended ? 'Giveaway already ended' : moment.duration(+r.endat - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]')}`);
				});
				msg.channel.send(embed);
			}
		}
	} 
};