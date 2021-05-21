const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'welcomeimage',
	requiredPermissions: 2, 
	Category: 'Welcome', 
	description: 'Set a welcome image or gif new members will be greeted with\nTenor gifs will not work',
	usage: 'h!welcomeimage [url of image or gif]',
	/* eslint-disable */
    async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		if (!args[0]) return msg.reply('You need to enter a Hex Color Code or `Random` -> `h!welcomeimage [link to image or gif]`');
		if (args[0].toLowerCase().includes('tenor')) msg.reply('**Watch out!** The link you entered contained the word `tenor`.\nLinks from Tenor will not work, upload the gif/image you want to imgur or another platform first');
		const res = await pool.query(`SELECT * FROM welcome WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined) {
			if (res.rowCount !== 0) {
				if (args[0].toLowerCase() == 'delete') {
					pool.query(`UPDATE welcome SET imageurl = null WHERE guildid = '${msg.guild.id}'`);
					msg.reply('The welcome image was deleted');
				} else
				if (args[0].toLowerCase().includes('https://') || args[0].toLowerCase().includes('http://')) {
					const embed = new Discord.MessageEmbed()
						.setImage(args[0])
						.setTitle('This is now the Welcome Image');
					msg.channel.send(embed).catch(() => {msg.reply('Something is wrong with the URL you entered. It could be I dont have access to the Website or Its not an Image or Gif');});
					const image = args[0].replace(/'/g, '%u205').replace(/`/g, '%o205');
					pool.query(`UPDATE welcome SET imageurl = '${image}' WHERE guildid = '${msg.guild.id}'`);
				} else {
					msg.reply('Whatever you entered was not a valid URL, please try again, you can see if its a valid URL when it gets Blue and Underlined in the Text Box of Discord');
				}
			} else {
				return msg.reply('Start the Welcome Message Setup first -> `h!welcomechanne`');
			}
		} else {
			return msg.reply('Start the Welcome Message Setup first -> `h!welcomechanne`');
		}


	}};