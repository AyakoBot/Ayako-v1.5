const Discord = require('discord.js');

module.exports = {
	name: 'contact',
	cooldown: 10000,
	perm: null,
	dm: true,
	takesFirstArg: true,
	aliases: null,
	execute(msg) {
		const tta = msg.args.slice(0).join(' ');
		const SuggestEmbed = new Discord.MessageEmbed()
			.setAuthor(`${msg.author.tag} / ${msg.author.id} / ${msg.guild.name}`, msg.client.ch.displayAvatarURL(msg.author))
			.setDescription(tta)
			.addField('\u200B', `${msg.url}`);
		msg.attachments.map(o => o);
		for (const attachment of msg.attachments) {SuggestEmbed.addField('Attachment', `${attachment.url}`);}
		msg.client.ch.send(msg.client.channels.cache.get('745080980431175792'), SuggestEmbed);
		const SuggestReplyEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.thanks.thanks, msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.setDescription(msg.lan.thanks.desc)
			.addField(msg.lan.thanks.field, '\u200B')
			.setTimestamp()
			.setColor(msg.client.ch.colorGetter(msg.guild ? msg.guild.me : null));
		msg.client.ch.reply(msg, SuggestReplyEmbed);

	}
};