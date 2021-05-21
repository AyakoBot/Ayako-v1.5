const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'xban',
	Category: 'Moderation',
	ThisGuildOnly: ['298954459172700181', '366219406776336385'],
	requiredPermissions: 4,
	description: 'Ban a user from Animekos and Gameverse at the same time',
	usage: 'h!xban [user ID or mention] (reason)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const VicsWonderland = client.guilds.cache.get('366219406776336385');
		const Animekos = client.guilds.cache.get('298954459172700181');
		if (msg.mentions.users.first()){
			xbanFunction(msg.mentions.users.first(), logchannelid, errorchannelID);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						xbanFunction(user, logchannelid, errorchannelID);
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
			}
		}
		async function xbanFunction(user, logchannelid){
			const logchannel = client.channels.cache.get(logchannelid);
			let banReason = args.slice(1).join(' ');

			if (user.id == msg.author.id) {
				msg.reply('You can\'t ban yourself');
				return;
			}
			if (user.id == '650691698409734151') {
				msg.reply('I won\'t ban myself');
				return;
			}
			if (!banReason) {
				banReason = 'no reason given';}
			if (!user) {
				msg.reply('Couldn\'t find that user');
				return;
			}
			try {
				if (!msg.guild.member(user).bannable) {
					msg.reply('I am not able to ban this user.');
					return;
				}} catch(error) {                
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}
			const guildmember = msg.guild.member(user);
			if (guildmember) {
				if (+msg.guild.member(msg.author).roles.highest.rawPosition < +guildmember.roles.highest.rawPosition || +msg.guild.member(msg.author).roles.highest.rawPosition == +guildmember.roles.highest.rawPosition) {
					msg.reply('You cant ban this user.');
				} else {
					if (!guildmember.bannable) {
						msg.reply('I am not able to ban this user.');
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
				if (msg.guild.member(user)) {
					const xBanEmbed = new Discord.MessageEmbed()
						.setTitle(`You have been banned from the servers __${VicsWonderland.name}__ and __${Animekos.name}__`)
						.setColor('#ff0000')
						.setDescription(`Reason: \`\`\`${banReason}\`\`\``)
						.addField('You can appeal for your punishment here:', 'https://docs.google.com/forms/d/1MMqfbW8G2Ihfhn-Zm7UkR6UfnrNj4vS8gyivZhGl2_E/')
						.setTimestamp();
					user.send(xBanEmbed).catch({});}
				setTimeout(() => {
					VicsWonderland.members.ban(user, {
						days: 1,
						reason: `Executor: ${msg.author.tag} | ${banReason}`,
					});
				}, 1000);
				setTimeout(() => {
					Animekos.members.ban(user, {
						days: 1,
						reason: `Executor: ${msg.author.tag} | ${banReason}`,
					});
				}, 1000);
				var ReplyEmbed = new Discord.MessageEmbed()
					.setColor('#ff0000')
					.setDescription(`${user} was banned from the servers __${Animekos.name}__ and ${VicsWonderland.name}`)
					.setTimestamp();
				msg.channel.send(ReplyEmbed);
				try {
					const xBanLogEmbed = new Discord.MessageEmbed()
						.setTitle(user.username + ' was banned from the server '+VicsWonderland.name+' and the server '+Animekos.name)
						.setColor('ff0000')
						.setThumbnail(user.displayAvatarURL())
						.setDescription(`${user} was banned by ${msg.author}`)
						.addField('Reason:', banReason)
						.setTimestamp()
						.setFooter('Banned user ID: ' +user.id+ ' \nExecutor user ID: '+msg.author.id+'\n');
					if (logchannel)logchannel.send(xBanLogEmbed).catch(() => {});
				} catch(error) {
					msg.channel.send('Could not send a ban log, please be sure to check the log-channel ID or ask <@318453143476371456> for help');}
			}
		}
	}
};
