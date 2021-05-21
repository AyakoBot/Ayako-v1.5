const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
module.exports = {
	name: 'giveawayreroll',
	Category: 'Giveaway',
	requiredPermissions: 2,
	description: 'Reroll a finished Giveaway',
	usage: 'h!giveawayreroll [message ID]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID, manager) {
        /* eslint-enable */
		if (!args[0]) return Send('You need to enter a MessageID -> `h!giveawayreroll [message ID]`');
		const messageID = args[0];
		if (isNaN(messageID)) return Send('That was not a valid MessageID or that Giveaway was deleted');
		const res = await pool.query(`SELECT * FROM giveawaysettings WHERE messageid = '${messageID}'`);
		if (res) {
			if (res.rows[0]) {
				if (res.rows[0].ended) {
					Send('Rerolling...');
					const r = res.rows[0];
					const channel = client.channels.cache.get(r.channelid);
					const m = await channel.messages.fetch(r.messageid);
					if (m && m.id) {
						const reaction = m.reactions.cache.find(r => r.emoji.name === '🎉');
						let users;
						if (reaction) {
							users = await reaction.users.fetch();
							users = users											
								.filter(u => u.bot === false)
								.filter(u => u.id !== client.user.id)
								.filter(u => m.guild.member(u.id));
							if (r.requirement == 'guild') {
								users = users.filter(u => client.guilds.cache.get(r.reqserverid).member(u.id));
							} else if (r.requirement == 'role') {
								users = users.filter(u => msg.guild.member(u).roles.cache.has(r.reqroleid));
							}
							users = users
								.random(r.winnercount)
								.filter(u => u)
								.map(u => m.guild.member(u));
						}
						let description;
						if (r.requirement == 'role') {
							description = `${r.description}\n\n**Requirement:**\nYou should have the role\n${msg.guild.roles.cache.get(r.reqroleid)}`;
						} else if (r.requirement == 'guild') {
							if (r.invitelink) {
								description = `${r.description}\n\n**Requirement**\nYou should be member of\n[${client.guilds.cache.get(r.reqserverid).name}](${r.invitelink} "Join ${client.guilds.cache.get(r.reqserverid).name} to claim the prize")`;
							} else {
								description = `${r.description}\n\n**Requirement**\nYou should be member of\n${client.guilds.cache.get(r.reqserverid).name}`;
							}
						} else {
							description = r.description;
						}
						const endat = r.endat;
						const embed = new Discord.MessageEmbed()
							.setDescription(description)
							.setTimestamp(new Date(+endat).toUTCString())
							.setColor('b0ff00')
							.setAuthor('Ayako Giveaways', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
							.setFooter('Ended at');
						if(users && users.length > 0) {
							embed.addField('Winner(s):', users.map(w => `<@${w.id}>`).join(', '));
							const winnerembed = new Discord.MessageEmbed()
								.setColor('b0ff00')
								.setDescription(description)
								.setFooter('End at')
								.setTimestamp(new Date(+endat).toUTCString());
							channel.send(`Congratulations, ${users.map(w => `<@${w.id}>`).join(', ')}! You won:`, winnerembed);
						} else {
							embed.addField('Giveaway cancelled, no valid participations', '\u200b');
						}
						m.edit(embed).catch(() => {});
					}
				} else {
					Send('That Giveaway hasn\'t ended yet.');
				}
			} else {
				return Send('That was not a valid MessageID or that Giveaway was deleted');}
		} else {
			return Send('That was not a valid MessageID or that Giveaway was deleted');
		}
		async function Send(m) {
			const ms = await msg.channel.send(m).catch(() => {});
			return ms;
		}
	}
};