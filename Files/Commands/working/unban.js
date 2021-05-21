const Discord = require('discord.js');
module.exports = {
	name: 'unban',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Unbans a user from the server',
	usage: 'h!unban [user ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			unbanFunction(msg.mentions.users.first(), logchannelid, errorchannelID);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {
					if(user && user.id){
						unbanFunction(user, logchannelid, errorchannelID);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
				let error;
				error = e;
				/* eslint-enable */
				}).catch({});
			} else {
				msg.reply('You need to specify a user.');
			}
		}
		async function unbanFunction(user, logchannelid){
			if (!msg.guild.member(client.user).permissions.has('BAN_MEMBERS')) return msg.reply('I am not able to unban this user.');
			const logchannel = client.channels.cache.get(logchannelid);
			let UnbanEmbed = new Discord.MessageEmbed()
				.setColor('#1aff00')
				.setDescription('Fetching bans <a:Loading:780543908861182013>')
				.setTimestamp();
			msg.channel.send(UnbanEmbed).then(async (m) => {
				let bannedUser;
				bannedUser = await msg.guild.fetchBan(user).catch(() => {});
				if (!bannedUser) {
					UnbanEmbed = new Discord.MessageEmbed()
						.setColor('ORANGE')
						.setDescription(`${user.username} | ${user.id} | ${user} is not banned`)
						.setTimestamp();
					m.edit(UnbanEmbed);
				}
				if (bannedUser) {
					try { msg.guild.members.unban(user);
					} catch(error) {
						UnbanEmbed = new Discord.MessageEmbed()
							.setColor('RED')
							.setDescription(`I was not able to unban ${user}\n\`\`\`${error}\`\`\``)
							.setTimestamp();
						m.edit(UnbanEmbed);
						return;
					} finally { const UnbanEmbed = new Discord.MessageEmbed()
						.setColor('#1aff00')
						.setDescription(`${user} was unbanned`)
						.setTimestamp();
					m.edit(UnbanEmbed);
					const UnbanLogEmbed = new Discord.MessageEmbed()
						.setTitle(`${user.username} was unbanned from the server `+msg.guild.name)
						.setDescription(`${user} was unbanned by ${msg.author}`)
						.setFooter(`Unbanned user ID: ${user.id}\nExecutor user ID: ${msg.author.id}`)
						.setThumbnail(user.displayAvatarURL())
						.setTimestamp()
						.setColor('#1aff00');
					if (logchannel) logchannel.send(UnbanLogEmbed).catch(() => {});}
				}
			});
		}
	}
};