const { pool } = require('../files/Database.js');

module.exports = {
	name: 'afk',
	Category: 'Miscellaneous',
	description: 'Display a AFK text whenever someone pings you, automatically deleted if you send a message after creating your AFK',
	usage: 'h!afk (text)',
/* eslint-disable */
  async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		let text = `${msg.author.username.replace(/'/g, '')} is AFK **since**`;
		if (args[0]) {
			text = `${args.slice(0).join(' ').replace(/'/g, '').replace(/`/g, '')}\n${msg.author.username.replace(/'/g, '')} is afk **since**`;
		}
		if (text.toLowerCase().includes('http://') || text.toLowerCase().includes('https://')) return msg.reply('You may not set Links as AFK.');
		const res = await pool.query(`SELECT * FROM afk WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}'`);
		if (res) {
			if (res.rows[0]) {
				pool.query(`
                    UPDATE afk SET text = '${text}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';
                    UPDATE afk SET since = '${Date.now()}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';
                `);
				if (args[0]) msg.reply('Alright, I\'ve updated your AFK to ```'+args.slice(0).join(' ')+'```', {disableMentions: 'all'}).catch(() => {});
				if (!args[0]) msg.reply('Alright, I\'ve updated your AFK').catch(() => {});
			} else {
				pool.query(`INSERT INTO afk (userid, text, since, guildid) VALUES ('${msg.author.id}', '${text}', '${Date.now()}', '${msg.guild.id}')`);
				if (args[0]) msg.reply('Alright, I\'ve set your AFK to ```'+args.slice(0).join(' ')+'```', {disableMentions: 'all'}).catch(() => {});
				if (!args[0]) msg.reply('Alright, I\'ve set your AFK').catch(() => {});
			}
		}
	} 
};