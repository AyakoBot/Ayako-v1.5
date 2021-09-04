const Discord = require('discord.js');

module.exports = {
	execute(msg) {
		if (!msg.channel || !msg.author) return;
		if (msg.author.id == msg.client.user.id) return;
		if (msg.channel.type !== 'DM') return;
		const dmembed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.standard.color)
			.setDescription(`${msg.author} / ${msg.author.id}\n\u200b${msg.content}`)
			.addField('\u200b', msg.url)
			.setTimestamp();
		for (let i = 0; i < msg.attachments.length; i++) {
			dmembed.addField('\u200b', msg.attachments[i].url);
		}
		for (let i = 0; i < msg.embeds.length; i++) {
			dmembed.addField('\u200b', msg.embeds[i].title ? msg.embeds[i].title : (msg.embeds[i].author) ? msg.embeds[i].author.name : 'none');
		}
		msg.client.ch.send(msg.client.channels.cache.get('825297763822469140'), dmembed);
	}
};