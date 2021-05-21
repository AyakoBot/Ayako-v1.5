
const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'anon',
	description: 'Post an anonymous message in <#832340837689065532>',
	usage: 'h!anon [text]',
	DMallowed: 'Yes',
	cooldown: 21600000,
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		if (msg.channel.type == 'dm') {
			if (client.guilds.cache.get('366219406776336385').member(msg.author).roles.cache.has('369619820867747844')) {
				const res = await pool.query(`SELECT * FROM anon WHERE authorid = '${msg.author.id}'`);
				if (res && res.rowCount > 0) {
					if (res.rows[0].banned == true) return msg.reply('You have been banned from using this command due to abuse');
				}
				const text = args ? args.slice(0).join(' ') : null;
				if (!text) return msg.reply('Please enter a message to share');
				const embed = new Discord.MessageEmbed()
					.setDescription(text)
					.setTimestamp()
					.setColor('b0ff00');
				const m = await client.channels.cache.get('832340837689065532').send(embed);
				msg.reply('Your story was sent successfully.\n'+m.url);
				pool.query(`INSERT INTO anon (authorid, msgid, banned) VALUES ('${msg.author.id}', '${m.id}', 'false')`);
			} else {
				return msg.channel.send('You are not permitted to use this command yet.\nRequirement is Level 30');
			}
		} else {
			if (msg.guild.id == '366219406776336385') {
				if (client.guilds.cache.get('366219406776336385').member(msg.author).roles.cache.has('776248679363248168')) {
					const text = args ? args[0] : null;
					if (!text) return msg.reply('Please enter a message ID request the Author of, or `ban [User id or mention]`');
					if (!isNaN(text)) {
						const res = await pool.query(`SELECT * FROM anon WHERE msgid = '${args[0]}'`);
						if (res && res.rowCount > 0) {
							client.channels.cache.get('832340837689065532').send(`${msg.author} has requested the author of https://discord.com/channels/366219406776336385/832340837689065532/${res.rows[0].msgid}`);
							const user = client.users.cache.get(res.rows[0].authorid);
							user.send(`${msg.author} has requested the Author of your message in <#832340837689065532>\nhttps://discord.com/channels/366219406776336385/832340837689065532/${res.rows[0].msgid}`);
							msg.reply(`${user} // ${user.id} // ${user.username} is the author of that message.\nYour request was logged in <#832340837689065532> and ${user.username}'s DMs`);
						} else {
							msg.reply('This Message is not anonymously sent');
						}
					} else {
						if (text.toLowerCase() == 'ban') {
							const id = args[1] ? args[1] : null;
							if (!id) return msg.reply('Please provide a ID to ban');
							const user = client.users.cache.get(id.replace(/\D+/g, ''));
							if (user) {
								pool.query(`UPDATE anon SET banned = 'true' WHERE authorid = '${user.id}'`);
								msg.reply(`${user} was banned from sending stories`);
								client.channels.cache.get('832340837689065532').updateOverwrite(msg.guild.member(user), { SEND_MESSAGES: false });
							} else {
								msg.reply('I couldnt find that user');
							}
						} else if (text.toLowerCase() == 'unban') {
							const id = args[1] ? args[1] : null;
							if (!id) return msg.reply('Please provide a ID to unban');
							const user = client.users.cache.get(id.replace(/\D+/g, ''));
							if (user) {
								pool.query(`UPDATE anon SET banned = 'false' WHERE authorid = '${user.id}'`);
								msg.reply(`${user} was unbanned from sending stories`);
								client.channels.cache.get('832340837689065532').updateOverwrite(msg.guild.member(user), { SEND_MESSAGES: null });
							} else {
								msg.reply('I couldnt find that user');
							}
						}
					}
				}
			}
		}
	}
};