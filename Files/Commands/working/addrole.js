const Discord = require('discord.js');
module.exports = {
	name: 'addrole',
	requiredPermissions: 3,
	Category: 'Miscellaneous',
	description: 'Create a new role in your server with standard permissions. Very usefull for big servers where normal role editing might cause a server outage',
	usage: 'h!addrole [hex color code or 000000] [name of the new role]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		if (!msg.guild.member(client.user).permissions.has('MANAGE_ROLES')) return msg.reply('I am not able to mute this user. Be sure I have the "Manage Roles" permission.');
		const RoleName = args.slice(1).join(' ');
		const RoleColor = args[0];
		if(!RoleName) {
			msg.reply('You need to give the role a name. -> `h!addrole [Hex Color Code] [Name]`');
			return;
		}
		if(!RoleColor) {
			msg.reply('You need to give the role a color -> `h!addrole [Hex Color Code] [Name]`');
			return;
		}

		var re = /[0-9A-Fa-f]{6}/g;
		if (RoleColor == 'none') {
			msg.guild.roles.create({
				data: {
					name: RoleName,
				},
			}).then(role => {
				const Embed = new Discord.MessageEmbed()
					.setDescription(`${role} was created`);
				msg.channel.send(Embed);
			});
		} else {
			if(re.test(RoleColor)) {
				try {
					msg.guild.roles.create({
						data: {
							name: RoleName,
							color: RoleColor,
						},
					}).then(role => {
						const Embed = new Discord.MessageEmbed()
							.setDescription(`${role} was created`)
							.setColor(RoleColor);
						msg.channel.send(Embed);
					});
				} catch(err) {
					msg.reply('The Hex color you entered isnt valid. Be sure its actually Hex. -> `h!addrole [Hex Color Code] [Name]`');
				}
			} else {
				msg.reply('The Hex color you entered isnt valid. Be sure its actually Hex. -> `h!addrole [Hex Color Code] [Name]`');
			}
		}
	}};
        
