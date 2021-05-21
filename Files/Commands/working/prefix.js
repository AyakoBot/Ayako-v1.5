const { pool } = require('../files/Database.js');
module.exports = {
	name: 'prefix',
	requiredPermissions: 2,
	description: 'Set the server custom Prefix',
	usage: 'h!prefix [new prefix]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (prefix.toLowerCase() !== 'h!') {
			msg.reply('this command is fixed to the standart prefix `h!` to not interfere with other bots.');
			return;
		}
		if (!args[0]) return msg.reply('You need to enter an option -> `h!prefix [prefix]` or `h!prefix delete`');
		if (args[0].toLowerCase() == 'delete') {
			pool.query(`SELECT prefix FROM prefix WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				const restext = `${result.rows[0]}`;
				if (restext == 'undefined') {
					msg.reply('I cant delete a prefix since there is none set.');
					return;
				} else {
					let sql = `DELETE FROM prefix WHERE guildid = '${msg.guild.id}';`;
					pool.query(sql);
					msg.reply('the server custom prefix has been deleted.');
				}
			});

		} else {
			pool.query(`SELECT prefix FROM prefix WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				const restext = `${result.rows[0]}`;
				if (restext == 'undefined') {
					let sql = `INSERT INTO prefix (guildid, prefix) VALUES ('${msg.guild.id}', '${args[0].toLowerCase()}')`;
					pool.query(sql);
					msg.reply(`the server custom prefix is now \`${args[0]}\``);
					return;
				} else {
					let sql = `UPDATE prefix SET prefix = '${args[0].toLowerCase()}' WHERE guildid = '${msg.guild.id}'`;
					pool.query(sql);
					msg.reply(`the server custom prefix is now \`${args[0]}\``);
				}
			});
		}

	}};