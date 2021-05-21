
const Discord = require('discord.js');
module.exports = {
	name: 'roleinfo',
	Category: 'Info',
	description: 'Shows role info of a role',
	usage: 'h!roleinfo [role ID]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
	
		if (args[0]) {
			if (isNaN(args[0])) {
				return msg.reply('Thats not a valid role ID');
			}
			const role = msg.guild.roles.cache.find(role => role.id === args[0]);
			roleFunction(role, errorchannelID) ;} else {msg.reply('You need to provide a role ID or a role Name.');
		}

		function roleFunction(role){
			var rgbToHex = function (rgb) { 
				var hex = Number(rgb).toString(16);
				if (hex.length < 2) {
					hex = '0' + hex;
				}
				return hex;
			};
			try{
				if (role.color == '0' || role.color == 0){
					var rolecolor = 'Default';
				} else {
					rolecolor = rgbToHex(role.color);
				}} catch(error) {msg.reply('This is not a valid role.');
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}
			const roleInfoEmbed = new Discord.MessageEmbed()
				.setTitle(role.name)
				.setColor(role.color)
				.setTimestamp()
				.addFields(
					{name:'Name', value:role.name, inline:true},
					{name:'ID', value:role.id, inline:true},
					{name:'Members in role', value:role.members.size, inline:true},
					{name:'Color', value:rolecolor, inline:false},
					{name:'Created on', value:role.createdAt.toLocaleString(), inline:false},
					{name:'Hoisted', value:role.hoist, inline:true},
					{name:'Mentionable', value:role.mentionable, inline:true},
					{name:'Permissions', value:role.permissions.bitfield, inline:true},
					{name:'Managed', value:role.managed, inline:true},
					{name:'Position', value:role.rawPosition, inline:true},
					{name:'Editable', value:role.editable, inline:true},
				);
			msg.channel.send(roleInfoEmbed);
		}}};