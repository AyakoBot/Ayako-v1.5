const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
module.exports = {
	name: 'amiin',
	description: 'Check if you are in the latest WiLLiS Giveaway',
	usage: 'h!amiin',
	ThisGuildOnly: ['108176345204264960'],
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		if (msg.channel.id == '805839305377447936') return;
		let id = args[0] ? args[0] : msg.author.id;
		const embed = new Discord.MessageEmbed();
		const res = await pool.query('SELECT * FROM stats');
		if (res.rows[0].willis == null) {
			embed.setDescription('<:tick:670163913370894346> You are NOT participating!\nGo to <#805839305377447936> and follow the instructions to enter')
				.setColor('ff0000');
			msg.channel.send(embed);
		} else
		if (res.rows[0].willis.includes(id)) {
			embed.setDescription('<:tick:670163913370894346> You are participating! Good Luck!')
				.setColor('b0ff00');
			msg.channel.send(embed);
		} else {
			embed.setDescription('<:tick:670163913370894346> You are NOT participating!\nGo to <#805839305377447936> and follow the instructions to enter')
				.setColor('ff0000');
			msg.channel.send(embed);
		}

	}
};