const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const ms = require('ms');

module.exports = {
	name: 'userinfo',
	Category: 'Info',
	description: 'Displays info about a User',
	usage: 'h!userinfo (user ID or mention)',
	aliases: ['whois'],
	DMallowed: 'Yes',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.content.includes('#')) {
			let user = client.users.cache.find(u => u.username == msg.content);
			console.log(user);
			if (user && user.id) {
				whoisFunction(user, errorchannelID);
				return;
			}
		}
		if (msg.mentions.users.first()){
			whoisFunction(msg.mentions.users.first(), errorchannelID);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {
					if(user && user.id){
						whoisFunction(user, errorchannelID);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(() =>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');

				});
			} else {
				let user = msg.author;
				whoisFunction(user, errorchannelID);
			}
		}
		async function whoisFunction(user){
			let platform;
			try{
				if (user.presence.clientStatus.desktop) {
					platform = '<:Desktop:740282925156794369> Desktop';
				} else if (user.presence.clientStatus.mobile) {
					platform = '<:Mobile:740286406550749216> Mobile';
				} else if (user.presence.clientStatus.web) {
					platform = '<:Browser:740287280052437073> Web';
				} else {platform = '⚠️ Unknown';}}
			catch(error) {
				platform = '⚠️ Unknown';
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}
			let statussince;
			const res = await pool.query(`SELECT * FROM status WHERE userid = '${user.id}'`);
			if (res !== undefined && res !== null) {
				if (res.rows[0] !== undefined && res.rows[0] !== null) {
					if (res.rows[0].offine == true) {
						statussince = `**Offline since** \`${ms(+Date.now() - +res.rows[0].offlinesince)}\`\n\`${new Date(+res.rows[0].offlinesince).toUTCString()}\``;
					}
					if (res.rows[0].online == true) {
						statussince = `**Online since** \`${ms(+Date.now() - +res.rows[0].onlinesince)}\`\n\`${new Date(+res.rows[0].onlinesince).toUTCString()}\``;
					}
					if (res.rows[0].idle == true) {
						statussince = `**Idle since** \`${ms(+Date.now() - +res.rows[0].idlesince)}\`\n\`${new Date(+res.rows[0].idlesince).toUTCString()}\``;
					}
					if (res.rows[0].dnd == true) {
						statussince = `**On dnd since** \`${ms(+Date.now() - +res.rows[0].dndsince)}\`\n\`${new Date(+res.rows[0].dndsince).toUTCString()}\``;
					}
				} else {
					statussince = '`Further Information unavailable (Awaiting grant of Presence Intent)`';
				}
			} else {
				statussince = '`Further Information unavailable (Awaiting grant of Presence Intent)`';
			}
			let game = user.presence.activities;
			gametext = `${game}`.replace(/,/g, ', ');
			let status;
			if (user.presence.status == 'online') {
				status = '<:online:313956277808005120> Online';
			} else if (user.presence.status == 'dnd') {
				status = '<:dnd:313956276893646850>  Do Not Disturb';
			} else if (user.presence.status == 'idle') {
				status = '<:idle:705332972295028839>  Idle';
			} else if (user.presence.status == 'offline') {
				status = '<:offline:313956277237710868> Offline';
			} else { 
				status = '⚠️ Unknown';
			}
			try {
				if (user.presence.activities[0].type == 'CUSTOM_STATUS') {
					const CUSTOMSTATUS = user.presence.activities[0].state;
					var gametext = `${CUSTOMSTATUS}, ${gametext}`;
					const regex2 = /Custom Status, /g;
					gametext = gametext.replace(regex2, '');
					const regex3 = /null, /g;
					gametext = gametext.replace(regex3, '');
					const regex4 = /Custom Status/g;
					gametext = gametext.replace(regex4, '');
				}} catch(error) {
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}
			if (gametext == '') {
				gametext = 'This user doesn\'t play any games right now';
			}

			if (user.id == '650691698409734151') {
				status = 'Hosted on a Windows OS machine';
			}
			try {
				const roles = msg.guild.member(user).roles.cache.sort((a, b) => b.rawPosition - a.rawPosition);
				let rolemap = roles.map(r => `${r}`).join(' | ');
				if (rolemap.length > 2000) {rolemap = 'Too many Roles to be displayed';}
				const whoisembed = new Discord.MessageEmbed()
					.setTitle(user.tag)
					.setColor('#b0ff00')
					.setDescription(`Username: \`${user.username}\`\nUser: ${user}\nID: \`${user.id}\`\n**Roles:**\n${rolemap}`)
					.addFields(
						{name: 'Joined at:', value:'<:MemberJoin:834324900952801291> '+msg.guild.member(user).joinedAt.toUTCString(), inline: true},
						{name: 'Created at:', value:'<:user_created:740288687920906345> '+user.createdAt.toUTCString(), inline: true},
						{name: 'Status:', value:`${status}\n${statussince}`, inline: true},
						{name: 'Platform:', value:platform, inline: true},
						{name: 'Game', value:`${gametext}\u200B`, inline: true},
						{name: 'Bot:', value:user.bot, inline: true},
						{name: 'Partial:', value:user.partial, inline: true},
					)
					.setTimestamp()
					.setThumbnail(user.displayAvatarURL({
						dynamic: true,
						size: 1024,
						format: 'png'
					}))
					.setFooter(`Requested by: ${msg.author.tag}`);
				msg.channel.send(whoisembed);
			} catch(error) {
				const whoisembed2 = new Discord.MessageEmbed()
					.setTitle(user.tag)
					.setColor('#b0ff00')
					.setDescription(`Username: \`${user.username}\`\nUser: ${user}\nID: \`${user.id}\`\n**Roles:**\nThis user is not a member of this guild`)
					.addFields(
						{name: 'Joined at:', value:'<:MemberLeave:834324833029586974> This user is not a member of this guild', inline: true},
						{name: 'Created at:', value:'<:user_created:740288687920906345> '+user.createdAt.toUTCString(), inline: true},
						{name: 'Status:', value:`${status}\n${statussince}`, inline: true},
						{name: 'Platform:', value:platform, inline: true},
						{name: 'Game', value:`${gametext}\u200B`, inline: true},
						{name: 'Bot:', value:user.bot, inline: true},
						{name: 'Partial:', value:user.partial, inline: true},
					)
					.setTimestamp()
					.setThumbnail(user.displayAvatarURL({
						dynamic: true,
						size: 1024,
						format: 'png'
					}))
					.setFooter(`Requested by: ${msg.author.tag}`);
				msg.channel.send(whoisembed2);
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}
		}
	}
};

