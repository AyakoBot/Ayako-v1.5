const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		if (!msg.channel || msg.channel.type == 'DM' || !msg.author || !msg.guild) return;
		if (msg.guild.id == '298954459172700181') {
			if (msg.author.id == '673362753489993749') {
				if (msg.embeds) {
					const embed = msg.embeds[0];
					if (embed) {
						if (embed.description) {
							if (embed.description.includes('got the card! ')) {
								const argsS = embed.description.split(/ +/);
								const user = msg.client.users.cache.get(argsS[1].replace(/\D+/g, ''));
								const res = await msg.client.ch.query('SELECT * FROM shoob WHERE userid = $1;', [user.id]);
								let amount = 0;
								if (res && res.rowCount > 0) {
									amount = res.rows[0].amount+1;
									msg.client.ch.query('UPDATE shoob SET amount = $2 WHERE userid = $1;', [user.id, amount]);
								} else msg.client.ch.query('INSERT INTO shoob (userid, amount) VALUES ($1, $2);', [user.id, 1]);
								const twentyRole = msg.guild.roles.cache.find(role => role.id === '755962444547096677');
								const fiftyRole = msg.guild.roles.cache.find(role => role.id === '756331367561822258');
								const hundretRole = msg.guild.roles.cache.find(role => role.id === '756331587616112660');
								const fivehundretRole = msg.guild.roles.cache.find(role => role.id === '756332260805967882');
								const kRole = msg.guild.roles.cache.find(role => role.id === '756597164850806896');
								const fivekRole = msg.guild.roles.cache.find(role => role.id === '756597282891366434');
								const rembed = new Discord.MessageEmbed();
								if (amount > 19) {
									if (!msg.member.roles.cache.has('755962444547096677')) {
										msg.member.roles.add(twentyRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${twentyRole} role`);    
									}
								} 
								if (amount > 49) {
									if (!msg.member.roles.cache.has('756331367561822258')) {
										msg.member.roles.add(fiftyRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${fiftyRole} role`);    
									}
								} 
								if (amount > 99) {
									if (!msg.member.roles.cache.has('756331587616112660')) {
										msg.member.roles.add(hundretRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${hundretRole} role`);    
									}
								} 
								if (amount > 499) {
									if (!msg.member.roles.cache.has('756332260805967882')) {
										msg.member.roles.add(fivehundretRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${fivehundretRole} role`);    
									}
								}
								if (amount > 999) {
									if (!msg.member.roles.cache.has('756597164850806896')) {
										msg.member.roles.add(kRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${kRole} role`);    
									}
								}
								if (amount > 4999) {
									if (!msg.member.roles.cache.has('756597282891366434')) {
										msg.member.roles.add(fivekRole).catch(() => {});
										rembed.setColor('b0ff00')
											.setDescription(`${user} now has the ${fivekRole} role`);    
									}
								}
								msg.client.ch.send(msg.channel, rembed);
							}
						}
					}
				}
			}
		}

	}
};