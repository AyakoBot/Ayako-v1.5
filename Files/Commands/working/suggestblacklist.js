const { pool } = require('../files/Database.js');
module.exports = {
	name: 'suggestblacklist',
	Category: 'Suggestion',
	requiredPermissions: 3,
	description: 'Blacklist a user from sending suggestions',
	usage: 'h!suggestblacklist [add/remove] [user ID or mention]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		if (!args[0]) return msg.reply('You need to tell me if you want to `add` or `remove` a user from the blacklist -> `h!suggestblacklist add/remove [user ID or mention]`').catch(() => {});
		if (!args[1]) return msg.reply('You need to tell what user you want to add/remove to/from the blacklist -> `h!suggestblacklist add/remove [user ID or mention]`').catch(() => {});
		const res = await pool.query(`SELECT * FROM suggestionsettings WHERE guildid = '${msg.guild.id}'`);
		let bl;
		if (res) {
			if (res.rows[0]) {
				bl = res.rows[0].blusers;
			} else {
				bl = null;
			}
		} else {
			bl = null;
		}
		if (args[0]) {
			if (args[0].toLowerCase() === 'add') {
				let user = client.users.cache.get(args[1]);
				if (!user || !user.id) {
					user = client.users.cache.get(args[1].replace(/<@/g, '').replace(/>/g, '').replace(/!/g, ''));
				}
				if (!user || !user.id) {
					return msg.reply('That was not a valid user ID or mention.').catch(() => {});
				} else {
					if (bl !== null) {
						if (bl.includes(user.id)) {
							return msg.reply('That user is already blacklisted').catch(() => {});
						}
					} else {
						bl = [];
					}
					bl.push(user.id);
					pool.query(`UPDATE suggestionsettings SET blusers = ARRAY[${bl}] WHERE guildid = '${msg.guild.id}'`);
					msg.reply(`${user} was added to the blacklist`).catch(() => {});
				}
			} else if (args[0].toLowerCase() === 'remove') {
				let user = client.users.cache.get(args[1]);
				if (!user || !user.id) {
					user = client.users.cache.get(args[1].replace(/<@/g, '').replace(/>/g, '').replace(/!/g, ''));
				}
				if (!user || !user.id) {
					return msg.reply('That was not a valid user ID or mention.').catch(() => {});
				} else {
					if (bl !== null) {
						if (!bl.includes(user.id)) {
							return msg.reply('That user is not blacklisted').catch(() => {});
						}
					} else {
						return msg.reply('That user is not blacklisted').catch(() => {});
					}
					if (bl.length == 1) {
						pool.query(`UPDATE suggestionsettings SET blusers = null WHERE guildid = '${msg.guild.id}'`);
					} else {
						const index = bl.indexOf(user.id);
						if (index > -1) {
							bl.splice(index, 1);
						}
						pool.query(`UPDATE suggestionsettings SET blusers = ARRAY[${bl}] WHERE guildid = '${msg.guild.id}'`);
					}
					msg.reply(`${user} was removed from the blacklist`).catch(() => {});
				}
			} else {
				return msg.reply('That was not a valid option, please enter either `add` or `remove`').catch(() => {});
			}

		}
	} 
};