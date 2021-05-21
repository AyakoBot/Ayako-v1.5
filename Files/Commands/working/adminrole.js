const Discord = require('discord.js');
const  { pool } = require('../files/Database');

module.exports = {
	name: 'adminrole',
	Category: 'ModerationAdvanced',
	requiredPermissions: 2,
	description: 'Set a role on your server to be the AdminRole',
	usage: 'h!adminrole [role ID or mention/delete]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		if (args[0]) {
			if (args[0] == 'delete') {
				let role = 'nothing';
				RoleFunction(msg, args, client, role, logchannelid);
				return;
			}
			let role = msg.mentions.roles.first();
			if (!role) {
				role = msg.guild.roles.cache.find(role => role.id === args[0]);
			}
			if (!role) {
				msg.reply('This role doesn\'t exist, be sure to provide a valid role ID or mention.');
				return;
			}
			if (role) {
				RoleFunction(msg, args, client, role, logchannelid);
			}
		} else {
			msg.reply('You need to specify a role');
			return;
		}

		async function RoleFunction(msg, args, client, role, logchannelid) {
			const logchannel = client.channels.cache.get(logchannelid);
			if (args[0].toLowerCase() == 'delete') {
				const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
				if (res && res.rowCount > 0) {
					const r = res.rows[0];
					if (r.trialmodrole || r.adminrole) pool.query(`UPDATE modroles SET adminrole = null WHERE guildid = '${msg.guild.id}'`);
					else pool.query(`DELETE FROM modroles WHERE guildid = '${msg.guild.id}'`);
					const replyEmbed = new Discord.MessageEmbed()
						.setDescription('The AdminRole has been deleted')
						.setColor('#b0ff00');
					msg.channel.send(replyEmbed);
					const LogEmbed = new Discord.MessageEmbed()
						.setTitle('AdminRole was deleted')
						.setDescription(`${msg.author} deleted the AdminRole`)
						.setColor('#b0ff00')
						.setTimestamp();
					if (logchannel)logchannel.send(LogEmbed).catch(() => {});
				} else {
					msg.reply('There is no AdminRole to delete');
				}
				return;
			}
			const LogEmbed = new Discord.MessageEmbed()
				.setTitle('AdminRole was set')
				.setDescription(`${msg.author} set ${role} as AdminRole.`)
				.setColor('#b0ff00')
				.setTimestamp();
			if (logchannel)logchannel.send(LogEmbed).catch(() => {});
			const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
			if (res && res.rowCount > 0) {
				pool.query(`UPDATE modroles SET adminrole = '${role.id}' WHERE guildid = '${msg.guild.id}'`);
			} else {
				pool.query(`INSERT INTO modroles (adminrole, guildid) VALUES ('${role.id}', '${msg.guild.id}')`);
			}
			const replyEmbed = new Discord.MessageEmbed()
				.setDescription(`${role} is now the AdminRole of this server.\nCheck out \`h!adminperms\` to set what commands an Admin is allowed to use`)
				.setColor('#b0ff00');
			msg.channel.send(replyEmbed);
		}
	}
};