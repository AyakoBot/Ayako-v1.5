const { pool } = require('../files/Database.js');
module.exports = {
	name: 'spanking',
	Category: 'Fun',
	description: 'Disable or enable spanking on yourself',
	usage: 'h!spanking (true/false)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		let existed = false;
		const res = await pool.query(`SELECT * FROM usersettings WHERE userid = '${msg.author.id}'`);
		if (res !== undefined) {
			if (res.rowCount !== 0) {
				existed = true;
			}
		}
		let msgSmall = msg.content.toLowerCase();
		if (msgSmall.includes('true')) {
			if (existed == true) {
				pool.query(`UPDATE usersettings SET spanktof = 'true' WHERE userid = '${msg.author.id}'`);
			} else {
				pool.query(`INSERT INTO usersettings (userid, spanktof) VALUES ('${msg.author.id}', 'true')`);
			}
			msg.reply('You are now spankable.');
		} else if (msgSmall.includes('false')) {
			if (existed == true) {
				pool.query(`UPDATE usersettings SET spanktof = 'false' WHERE userid = '${msg.author.id}'`);
			} else {
				pool.query(`INSERT INTO usersettings (userid, spanktof) VALUES ('${msg.author.id}', 'false')`);
			}
			msg.reply('You are no longer spankable.');
		} else {
			msg.reply('Pick an option: `True` or `False`');
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (answer.includes('spanking')) return;
				if (answer.includes('true') || answer.includes('yes')) {
					if (existed == true) {
						pool.query(`UPDATE usersettings SET spanktof = 'true' WHERE userid = '${msg.author.id}'`);
					} else {
						pool.query(`INSERT INTO usersettings (userid, spanktof) VALUES ('${msg.author.id}', 'true')`);
					}
					msg.reply('You are now spankable.');
				} else if (answer.includes('false') || answer.includes('no')) {
					if (existed == true) {
						pool.query(`UPDATE usersettings SET spanktof = 'false' WHERE userid = '${msg.author.id}'`);
					} else {
						pool.query(`INSERT INTO usersettings (userid, spanktof) VALUES ('${msg.author.id}', 'false')`);
					}
					msg.reply('You are no longer spankable.');
				} else {
					return;
				}
			}).catch(() => {});
		}
	}
};