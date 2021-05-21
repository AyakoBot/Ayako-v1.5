const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'boosting',
	description: 'Display the current amount of boosting days',
	usage: 'h!boosting (user ID or mention)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
			/* eslint-enable */
		if (msg.mentions.users.first()){
			boostingFunction(msg.mentions.users.first());
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						boostingFunction(user);
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
				let user = msg.author;
				boostingFunction(user);
			}
		}


		async function boostingFunction(user){
			const Embed = new Discord.MessageEmbed()
				.setColor('#b0ff00');
			const res = await pool.query(`SELECT * FROM nitroboosters WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
			if (res) {
				if (res.rows[0]) {
					Embed.setDescription(`${user} has been boosting ${msg.guild.name} since ${res.rows[0].days} days.\nIs still boosting: ${res.rows[0].stillactive}`);
				} else {
					Embed.setDescription(`${user} has not been boosting ${msg.guild.name} or the Nitro Monitoring Feature isn't enabled.`);
				}
			} else {
				Embed.setDescription(`${user} has not been boosting ${msg.guild.name} or the Nitro Monitoring Feature isn't enabled.`);
			}

			msg.channel.send(Embed);
		}}};
