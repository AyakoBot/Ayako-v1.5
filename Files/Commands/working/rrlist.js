const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'rrlist',
	Category: 'Selfroles',
	description: 'Show all reaction roles of the server',
	usage: 'h!rrlist',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		const hadalready = [];
		const res = await pool.query(`SELECT * FROM reactionroles WHERE guildid = '${msg.guild.id}'`);
		if (res) {
			if (res.rows[0]) {
				const embed = new Discord.MessageEmbed()
					.setDescription('Gathering Information <a:load:670163928122130444>')
					.setColor('b0ff00')
					.setAuthor('Ayako Reaction Roles', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
				const m = await msg.channel.send(embed).catch(() => {});
				for(let i = 0; i < res.rowCount; i++) {
					let doesntexist;
					let desc;
					const channel = client.channels.cache.get(res.rows[i].channelid);
					if (channel && channel.id) {
						const m = await channel.messages.fetch(res.rows[i].msgid).catch(() => {doesntexist = true;});
						if (m) {
							if (m.id) {
								const arg = m.embeds[0].description.split(/\n+/);
								desc = `\n\`\`\`${arg[0]}\`\`\``;
							}
						}
						if (doesntexist) {
							pool.query(`DELETE FROM reactionroles WHERE msgid = '${res.rows[i].msgid}'`);
							hadalready.push(res.rows[i].msgid);
						}
						let rolemap = [];
						const res2 = await pool.query(`SELECT * FROM reactionroles WHERE msgid = '${res.rows[i].msgid}' AND guildid = '${msg.guild.id}'`);
						if (res2) {
							if (res2.rows[0]) {
								for (let i = 0; i < res2.rowCount; i++) {
									rolemap.push(`<@&${res2.rows[i].roleid}>`);
								}
							}
						}
						rolemap = rolemap.map(r => `${r}`).join(' | ');
						if (!hadalready.includes(res.rows[i].msgid)) {
							hadalready.push(res.rows[i].msgid);
							const res2 = await pool.query(`SELECT * FROM reactionroles WHERE msgid = '${res.rows[i].msgid}'`);
							embed.addField(`Reaction Role Message with ${res2.rowCount} roles${desc}`, `[Click here](https://discord.com/channels/${res.rows[i].guildid}/${res.rows[i].channelid}/${res.rows[i].msgid})\n${rolemap}`);
						}
						embed.setDescription(`All Reaction Role Messages of ${msg.guild.name}`);
					}
				}
				m.edit(embed).catch(() => {});
			} else {
				msg.reply('There are no Reaction Role Messages on this server yet. Create some with `h!rrcreate`').catch(() => {});
			}
		} else {
			msg.reply('There are no Reaction Role Messages on this server yet. Create some with `h!rrcreate`').catch(() => {});
		}
	}
};