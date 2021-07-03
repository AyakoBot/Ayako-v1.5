const Discord = require('discord.js');
const path = require('path');

module.exports = {
	perm: 32n,
	type: 2,
	displayEmbed(msg) {
		// eslint-disable-next-line no-undef
		const lan = msg.language.commands.settings[path.basename(__filename).replace('.js', '')];
		const lan2 = msg.language.commands.settings;
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(lan2.author, {type: lan.type}))
			.addField('\u200b', msg.client.ch.stp(lan.info, {time: `<t:${((+new Date().getHours() >= 1 ? new Date(new Date().getFullYear(), new Date().getMonth(), +new Date().getDate()+1) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())+3600000) / 1000)}:t> / <t:${((+new Date().getHours() >= 1 ? new Date(new Date().getFullYear(), new Date().getMonth(), +new Date().getDate()+1) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())+3600000) / 1000)}:R>`}));
		return embed;
	}
};