const Discord = require('discord.js');

module.exports = {
	name: 'rate',
	perm: null,
	dm: false,
	takesFirstArg: true,
	aliases: ['support'],
	type: 'info',
	description: 'Send a rate request',
	usage: ['rate [User Name or User description]'],
	thisGuildOnly: ['692452151112368218'],
	async execute(msg) {
		msg.delete().catch(() => { });
		const embed = new Discord.MessageEmbed()
			.setDescription(msg.args.slice(0).join(' '))
			.setColor(msg.client.ch.colorGetter(msg.guild.me));
		msg.react('670163913370894346').catch(() => {});
		const m = await msg.client.ch.send(msg.client.channels.cache.get('746665867567300679'), embed)
		m.react('✅').catch(() => { });
		m.react('❓').catch(() => { });
		m.react('🤬').catch(() => { });
		m.react('🤏').catch(() => { });
		m.react('❌').catch(() => { });
	}
};