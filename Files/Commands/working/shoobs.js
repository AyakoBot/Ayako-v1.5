const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'shoobs',
	ThisGuildOnly: ['298954459172700181'],
	description: 'Display the amount of shoob cards a user has claimed',
	usage: 'h!shoobs (user ID or mention)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */		
		
		if (msg.mentions.users.first()){
			shoobsFunction(msg.mentions.users.first(), errorchannelID);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						shoobsFunction(user, errorchannelID);
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
				shoobsFunction(user, errorchannelID);
			}
		}


		async function shoobsFunction(user){
			const res = await pool.query(`SELECT * FROM shoob WHERE userid = '${user.id}'`);
			let content;
			if  (res && res.rowCount > 0) {
				content = `${res.rows[0].amount} cards claimed`;
			} else{
				content = 'No card claims recorded';
			}
			const leaderboard = new Discord.MessageEmbed()
				.setTitle(`${user.username}'s Cards`)
				.setColor('#b0ff00')
				.setDescription(content)
				.setTimestamp();
			msg.channel.send(leaderboard);
		}
	}
};