const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'clearwarns',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Clear all warns of a User',
	usage: 'h!clearwarns [user ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			clearwarnFunction(msg.mentions.users.first());
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {
					if(user && user.id){
						clearwarnFunction(user);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(()=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
				}).catch(() => {});
			} else {
				clearwarnFunction(msg.author);
			}
		}


		function clearwarnFunction(user) {
			msg.channel.send(`Are you sure you want to delete all warns of ${user}?\nReply with \`Yes\` or \`No\``);
			step1(user);
		}

		function step1(user) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(async collected => {
				let reply = collected.first().content.toLowerCase();
				if (reply == 'yes') {
					const embed = new Discord.MessageEmbed()
						.setDescription('<a:load:670163928122130444> Clearing warns')
						.setColor('YELLOW');
					const m = await msg.channel.send(embed);
					const res = await pool.query(`SELECT * FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
					if (res !== undefined) {
						if (res.rows[0] !== undefined) {
							await pool.query(`DELETE FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
							embed.setDescription(`<:tick:670163913370894346> Deleted all warns of ${user}`);
							embed.setColor('b0ff00');
							m.edit(embed);
							const logchannel = client.channels.cache.get(logchannelid);
							const logembed = new Discord.MessageEmbed()
								.setTitle(`${user.username}'s warns have been cleared on the server ${msg.guild.name}`)
								.setDescription(`${user}'s warns were cleared by ${msg.author}`)
								.setThumbnail(user.displayAvatarURL())
								.setColor('#1aff00')
								.setTimestamp()
								.setFooter(`Cleared user ID: ${user.id}\nExecutor user ID: ${msg.author.id}`);
							for (let i = 0; i < res.rowCount; i++) {
								let details;
								if (res.rows[i].warnedbyuserid !== null) {
									details = ` | Given by: ${res.rows[i].warnedbyusername} in ${res.rows[i].warnedinchannelname}`;
								} else {
									details = '\u200b';
								}
								logembed.addField(`Warn Type: \`${res.rows[i].type}\``+details, `Warn Reason: \`\`\`${res.rows[i].reason}\`\`\``);
							}
							if (logchannel) logchannel.send(logembed);
						} else {
							embed.setDescription(`<:Cross:746392936807268474> ${user} has no warns`);
							embed.setColor('b0ff00');
							m.edit(embed);
							return;
						}
					} else {
						embed.setDescription(`<:Cross:746392936807268474> ${user} has no warns`);
						embed.setColor('b0ff00');
						m.edit(embed);
						return;
					}
				} else if (reply == 'no') {
					msg.reply('Aborted');
					return;
				} else {
					msg.reply('That was not a valid reply. Try again.');
					step1(user);
					return;
				}
			}).catch(() => {msg.reply('Time ran out, please start over');});
		}
	} 
};

