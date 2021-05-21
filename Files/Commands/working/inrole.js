const Discord = require('discord.js');
module.exports = {
	name: 'inrole',
	Category: 'Info',
	description: 'Displays all Members of a role',
	usage: 'h!inrole [role ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		let role;
		if (!isNaN(args[0])) {
			role = msg.guild.roles.cache.find(role => role.id === args[0]);
			rolemapFunction(msg, role, errorchannelID);
		}
		if (!role) {
			if (isNaN(args[0])) {
				let id = args[0].replace(/<@&/g, '').replace(/>/g, '');
				role = msg.guild.roles.cache.find(r => r.id === id);
				rolemapFunction(msg, role, errorchannelID) ;} else {msg.reply('You need to provide a role ID or a role Name.');
			}
		}


		async function rolemapFunction(msg, role){
			try{role.color;} catch(error) {
				msg.reply('This is not a valid role.');
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
				return;}
			let rolecolor;
			if (role.color == '0' || role.color == 0){
				rolecolor = '36393F';} else {rolecolor = role.color;}
			const ListEmbed = new Discord.MessageEmbed()
				.setColor(rolecolor)
				.setDescription('<a:load:670163928122130444> Loading member list')
				.setTimestamp();
			const m = await msg.channel.send(ListEmbed);
			await client.guilds.fetch(msg.guild.id);
			let rolemap = role.members.map(m=>m.user).join('\n');
			if (rolemap.length > 2000) {rolemap = 'Too many Members to be displayed';}
			ListEmbed.setTitle('There are '+role.members.size+' users with the '+role.name+' role:');
			ListEmbed.setColor(rolecolor);
			ListEmbed.setDescription(rolemap);
			ListEmbed.setTimestamp();
			m.edit(ListEmbed); 
		}}};