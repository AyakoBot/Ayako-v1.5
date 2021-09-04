const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(reaction, user) {
		if (user.id == client.user.id) return; 
		const ch = client.ch;
		const guild = reaction.message.guild;
		const member = await guild.members.fetch(user.id);
		if (reaction.message.channel.id == '805839305377447936') {
			const msg = await reaction.message.channel.messages.fetch(reaction.message.id);
			if (member && msg.author.id && msg.author.id) {
				if (member.roles.cache.has('278332463141355520') || member.roles.cache.has('293928278845030410') || member.roles.cache.has('768540224615612437')) {
					const logchannel = client.channels.cache.get('805860525300776980');
					const res = await ch.query('SELECT * FROM stats;');
					if (reaction.emoji.name == '✅') {
						reaction.message.delete().catch(() => {});
						if (msg.author) {
							const embed2 = new Discord.MessageEmbed()
								.setColor('b0ff00')
								.setThumbnail(user.displayAvatarURL())
								.setDescription(`${user} accepted the submission of ${msg.author}`)
								.setAuthor(msg.author.username, msg.author.displayAvatarURL())
								.setTimestamp();
							const log = await logchannel.send(embed2).catch(() => {});
							if (res.rows[0].willis) {
								if (res.rows[0].willis.includes(msg.author.id)) {
									const embed = new Discord.MessageEmbed()
										.setAuthor('Childe Giveaway!', 'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
										.setDescription('**You already entered the Giveaway!**')
										.setColor('YELLOW')
									//.addField('\u200b', '[Click here to get to the Giveaway](https://givelab.com/genshin10k/)')
										.setTimestamp();
									await msg.author.send(embed).then(() => {
										log.react('670163913370894346');
									}).catch(() => {});
									return;
								} else {
									const embed = new Discord.MessageEmbed()
										.setAuthor('Childe Giveaway!', 'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
										.setDescription('**Your submission was accepted!**\nGood Luck!')
										.setColor('b0ff00')
									//.addField('\u200b', '[Click here to get to the Giveaway](https://givelab.com/primogem/10k-primogem-giveaway)')
										.setTimestamp();
									await msg.author.send(embed).then(() => {
										log.react('670163913370894346');
									}).catch(() => {});
									let array =  [];
									array = res.rows[0].willis;
									array.push(msg.author.id);
									const newnr = +res.rows[0].count + 1;
									ch.query('UPDATE stats SET willis = $1; UPDATE stats SET count = $2;', [array, newnr]);
								}
							} else {
								const embed = new Discord.MessageEmbed()
									.setAuthor('Childe Giveaway!', 'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
									.setDescription('**Your submission was accepted!**\nGood Luck!')
									.setColor('b0ff00')
								//.addField('\u200b', '[Click here to get to the Giveaway](https://givelab.com/primogem/10k-primogem-giveaway)')
									.setTimestamp();
								const m = await ch.send(msg.author, embed);
								if (m && m.id) log.react('670163913370894346');
								else log.react('746392936807268474');
								ch.query('UPDATE stats SET willis = $1; UPDATE stats SET count = $2;', [[msg.author.id], 1]);
							}
						}
					}
					if (reaction.emoji.name == '❌') {
						reaction.message.delete().catch(() => {});
						if (msg.author) {
							const embed2 = new Discord.MessageEmbed()
								.setColor('ff0000')
								.setThumbnail(user.displayAvatarURL())
								.setDescription(`${user} rejected the submission of ${msg.author}`)
								.setAuthor(msg.author.username, msg.author.displayAvatarURL())
								.setTimestamp();
							const log = await logchannel.send(embed2).catch(() => {});
							const embed = new Discord.MessageEmbed()
								.setAuthor('Childe Giveaway!', 'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
								.setDescription('**Your submission was rejected!**')
								.addField('Please check back on the requirements', '[Click here to get to the requirements](https://discord.com/channels/108176345204264960/805839305377447936/827248223922946118)')
								.setColor('ff0000')
							//.addField('\u200b', '[Click here to get to the Giveaway](https://givelab.com/genshin10k/)')
								.setTimestamp();
							const m = await ch.send(msg.author, embed);
							if (m && m.id) log.react('670163913370894346');
							else log.react('746392936807268474');
						}
					}
				}
			}
		}

	}
};