const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	name: 'rank',
	Category: 'Leveling',
	description: 'Display a users current level',
	usage: 'h!rank (user ID or mention)',
	/* eslint-disable */
	execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
		/* eslint-enable */		
		if (msg.mentions.users.first()){
			rankFunction(msg.mentions.users.first(), errorchannelID);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						rankFunction(user, errorchannelID);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
                    let error;
                    error = e;
                    /* eslint-enable */
				}).catch(() => {});
			} else {
				let user = msg.author;
				rankFunction(user, errorchannelID);
			}
		}
		async function rankFunction(user) {
			const res = await pool.query(`SELECT * FROM levelserver WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
			const resA = await pool.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}'`);
			if (res !== undefined && res.rows[0] !== undefined) {
				const level = res.rows[0].level;
				const xp = res.rows[0].xp;
				let gain;
				if (resA !== undefined) {
					if (resA.rows[0] !== undefined) {
						gain = resA.rows[0].xpgain;
					} else {
						gain = 1;
					}
				} else {
					gain = 1;
				}
				const newLevel = +level + 1;
				const neededXP = 5 / 6 * +newLevel * (2 * +newLevel * +newLevel + 27 * +newLevel + 91);
				const duration = moment.duration(Math.floor((+neededXP - +xp) / 20) / gain * 60000).format(' D [days], H [hrs], m [mins]');
				const embed = new Discord.MessageEmbed()
					.setAuthor(user.tag, user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
					.setDescription(`**__Level: ${level}__**`)
					.setColor('b0ff00')
					.addFields(
						{name: 'Current XP', value: `${xp}xp`, inline: true},
						{name: 'XP needed for next level', value: `${Math.floor(neededXP)}xp`, inline: true},
						{name: 'XP difference', value: `${Math.floor(+neededXP - +xp)}xp`, inline: true},
						{name: '\u200b', value: `This will take an average of about \n**${Math.floor((+neededXP - +xp) / gain / 20)} counted messages** or \n**${duration}**\n since only 1 message per minute is counted`, inline: false}
					);
				msg.channel.send(embed);
			} else {
				msg.reply(`\`${user.tag}\` is not ranked yet.`);
			}
		}
	}
};
