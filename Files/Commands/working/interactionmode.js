const { pool } = require('../files/Database.js');
module.exports = {
	name: 'interactionmode',
	requiredPermissions: 2,
	aliases: ['interactionsmode'],
	Category: 'Fun',
	description: 'Edit the size of interactions',
	usage: 'h!interactionsmode [big or small]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) return msg.reply('You need to tell me what interaction mode you want `Big` or `Small`');
		if (args[0].toLowerCase() == 'small') {
			pool.query(`SELECT mode FROM interactionsmode WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				const restext = `${result.rows[0]}`;
				let sql;
				if (restext == 'undefined') {
					sql = `INSERT INTO interactionsmode (mode, guildid) VALUES ('true', '${msg.guild.id}')`;
				} else {
					sql = `UPDATE interactionsmode SET mode = 'true' WHERE guildid = '${msg.guild.id}'`;
				}
				pool.query(sql);
				msg.channel.send('Interactions Mode has been Updated to `Small` <:Small2:756379369739386910><:Small1:756379345190387712>');
			});
		} else if (args[0].toLowerCase() == 'big') {
			pool.query(`SELECT mode FROM interactionsmode WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				const restext = `${result.rows[0]}`;
				let sql;
				if (restext == 'undefined') {
					sql = `INSERT INTO interactionsmode (mode, guildid) VALUES ('false', '${msg.guild.id}')`;
				} else {
					sql = `UPDATE interactionsmode SET mode = 'false' WHERE guildid = '${msg.guild.id}'`;
				}
				pool.query(sql);
				msg.channel.send('Interactions Mode has been Updated to `Big` <:Big:756380855395549256>');
			});
		} else {msg.reply('You need to tell me what interaction mode you want `Big` or `Small`');}
	}};