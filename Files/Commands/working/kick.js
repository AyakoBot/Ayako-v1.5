const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'kick',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Kick a user from the server',
	usage: 'h!kick [user ID or mention] (reason)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			kickFunction(msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {
	
					if(user && user.id){
						kickFunction(user, logchannelid);
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
		async function kickFunction(user, logchannelid){
			if (!msg.guild.member(user)) return msg.reply('This user is not a member of this server');
			const logchannel = client.channels.cache.get(logchannelid);
			let kickReason = args.slice(1).join(' ');
			if (!kickReason) {
				kickReason = 'no reason given';}
			if (!user) {
				msg.reply('Could not find that user.');
			}
			if (user.id == '650691698409734151') {
				msg.reply('I won\'t kick myself');
				return;
			}
			const guildmember = msg.guild.member(user);
			if (guildmember) {
				if (+msg.guild.member(msg.author).roles.highest.rawPosition < +guildmember.roles.highest.rawPosition || +msg.guild.member(msg.author).roles.highest.rawPosition == +guildmember.roles.highest.rawPosition) {
					msg.reply('You cant kick this user.');
				} else {
					if (!guildmember.kickable) {
						msg.reply('I am not able to kick this user.');
						return;
					}
					const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						if (r.adminrole) { 
							const role = msg.guild.roles.cache.find(role => role.id === r.adminrole);
							if (role && role.id) {
								if (guildmember.roles.cache.has(role.id)) {
									waiter();
									return;
								}
							}
						}
					}
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						if (r.modrole) { 
							const role = msg.guild.roles.cache.find(role => role.id === r.modrole);
							if (role && role.id) {
								if (guildmember.roles.cache.has(role.id)) {
									waiter();
									return;
								}
							}
						}
					}					
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						if (r.trialmodrole) { 
							const role = msg.guild.roles.cache.find(role => role.id === r.trialmodrole);
							if (role && role.id) {
								if (guildmember.roles.cache.has(role.id)) {
									waiter();
									return;
								}
							}
						}
					}
					proceednormally();
				}
			} else {
				proceednormally();
			}
			async function waiter() {  
				const m = await msg.reply('You just issued a **moderation command** on a user with **moderator role**. \nDo you want to **proceed or abort**.').catch(() => {});
				m.react('670163913370894346').catch(() => {});
				m.react('746392936807268474').catch(() => {});
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 30000}).then(rawcollected => {
					if (!rawcollected.first()) return;
					if (rawcollected.first().content.toLowerCase() == 'y' || rawcollected.first().content.toLowerCase() == 'yes' || rawcollected.first().content.toLowerCase() == 'proceed' || rawcollected.first().content.toLowerCase() == 'continue' || rawcollected.first().content.toLowerCase() == 'go') {
						if (m.deleted == false) {
							rawcollected.first().delete().catch(() => {});
							m.delete().catch(() => {});
							proceednormally();
						}
					} else {
						m.delete().catch(() => {});
						return;
					}
				}).catch(() => {m.delete().catch(() => {});});

				m.awaitReactions((reaction, user) => (reaction.emoji.id === '670163913370894346' || reaction.emoji.id === '746392936807268474') && user.id === msg.author.id,
					{max: 1, time: 60000}).then(rawcollected => {
					if (!rawcollected.first()) return;
					if (rawcollected.first()._emoji.id == '670163913370894346') {
						m.delete().catch(() => {});
						proceednormally();
					} else {
						m.delete().catch(() => {});
						return;
					}
				}).catch(() => {m.delete().catch(() => {});});

			}
			async function proceednormally() {

				var ReplyEmbed = new Discord.MessageEmbed()
					.setColor('#ff0000')
					.setDescription(`${user} was kicked from the server`)
					.setTimestamp();
        
				const KickEmbed = new Discord.MessageEmbed()
					.setTitle(`You have been kicked from the server __${msg.guild.name}__`)
					.setColor('#ff0000')
					.setDescription(`Reason: \`\`\`${kickReason}\`\`\``)
					.setTimestamp();
				user.send(KickEmbed).catch(() => {});
				setTimeout(() => {
					if (msg.guild.member(user)) {
						msg.guild.member(user).kick(`${msg.author.username} | ${kickReason}`).then(msg.channel.send(ReplyEmbed));
					}
				}, 1000);
				const KickLogEmbed = new Discord.MessageEmbed()
					.setTitle(user.username + ' was kicked from the server '+ msg.guild.name)
					.setColor('ff0000')
					.setThumbnail(user.displayAvatarURL())
					.setDescription(`${user} was kicked by ${msg.author}`)
					.addField('Reason:', kickReason)
					.setTimestamp()
					.setFooter('Kicked user ID: ' +user.id+ ' \nExecutor user ID: '+msg.author.id+'\n');
				if (logchannel)logchannel.send(KickLogEmbed).catch(() => {});
			}}}
};

    
        
    