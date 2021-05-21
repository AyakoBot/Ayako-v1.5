const Discord = require('discord.js');
module.exports = {
	name: 'rate',
	requiredPermissions: 6,
	ThisGuildOnly: ['692452151112368218'],
	description: 'Send a rate request',
	usage: 'h!rate [username]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		setTimeout(() => {
			msg.delete();
		}, 1000);
		const promotion = args.slice(0).join(' ');
		if (!promotion) return msg.reply('You need to tell me who\'s up for rating');
		const SuggestEmbed = new Discord.MessageEmbed()
			.setDescription(promotion)
			.setColor('#b0ff00');
		msg.channel.send('<:tick:670163913370894346>').catch({
		}).then(send => { setTimeout(function(){  send.delete();  }, 4000);  }).catch();
		client.channels.cache.get('746665867567300679').send(SuggestEmbed)
			.then(m => {
				m.react('✅');
				m.react('❓');                       
				m.react('🤬');
				m.react('🤏');
				m.react('❌');
			});

	}
};