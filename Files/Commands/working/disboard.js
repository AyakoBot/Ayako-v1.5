const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'disboard',
	Category: 'Miscellaneous',
	requiredPermissions: 3,
	description: 'Show the disboard commands and current settings',
	usage: 'h!disboard\nh!disboard [enable/disable]\nh!disboard role [role ID or mention]',
/* eslint-disable */
  async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		let enabled = '<:Cross:746392936807268474>';
		let role = '<:Cross:746392936807268474>';
		const res = await pool.query(`SELECT * FROM disboard WHERE guildid = '${msg.guild.id}'`);
		if (res) {
			if (res.rows[0]) {
				if (res.rows[0].enabled == true) {enabled = '<:tick:670163913370894346>';}
				if (res.rows[0].role) role = `<@&${res.rows[0].role}>`;
			}
		}
		if (!args[0]) {

			const embed = new Discord.MessageEmbed()
				.setAuthor('Ayako DISBOARD Bump Reminder Settings', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription(`
                - \`h!disboard disable\`/\`h!disboard enable\` - \nEnable or Disable DISBOARD Bump reminders\n
                - \`h!disboard role [role ID or mention]\` - \nThe Role I will ping as soon as you can Bump again

                Enabled: ${enabled}
                Role: ${role}
                `)
				.setTimestamp()
				.setColor('b0ff00');
			msg.channel.send(embed);
		}
		if (args[0]) {
			const reply = args[0].toLowerCase();
			if (reply == 'role') {
				let role = msg.mentions.roles.first();
				if (!role || !role.id) {
					role = msg.guild.roles.cache.get(args[1].replace(/<@&/g, '').replace(/>/g, ''));
				}
				if (!role || !role.id) {
					msg.reply('That was not a valid Role ID or mention').catch(() => {});
					return;
				}
				if (res) {
					if (res.rows[0]) {
						pool.query(`UPDATE disboard SET role = '${role.id}' WHERE guildid = '${msg.guild.id}';`);
					} else {
						pool.query(`INSERT INTO disboard (guildid, role, enabled) VALUES ('${msg.guild.id}', '${role.id}', 'false')`);
					}
				} else {
					pool.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', 'false')`);
				}
				msg.channel.send('The Disboard ping Role has been set to `'+role.name+'`').catch(() => {});
			}
			if (reply == 'enable') {
				if (res) {
					if (res.rows[0]) {
						pool.query(`UPDATE disboard SET enabled = 'true' WHERE guildid = '${msg.guild.id}';`);
					} else {
						pool.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', 'true')`);
					}
				} else {
					pool.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', 'true')`);
				}
				msg.channel.send('Disboard Bump Reminders are now enabled').catch(() => {});
			}
			if (reply == 'disable') {
				if (res) {
					if (res.rows[0]) {
						pool.query(`UPDATE disboard SET enabled = 'false' WHERE guildid = '${msg.guild.id}';`);
					} else {
						pool.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', 'false')`);
					}
				} else {
					pool.query(`INSERT INTO disboard (guildid, enabled) VALUES ('${msg.guild.id}', 'false')`);
				}
				msg.channel.send('Disboard Bump Reminders are now disabled').catch(() => {});
			}
		}
	}
};
