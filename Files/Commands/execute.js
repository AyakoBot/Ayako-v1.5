const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async execute(msg) {


		const row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageButton()
					.setCustomId('done')
					.setLabel(msg.language.done)
					.setStyle('DEFAULT')
			);
		msg.channel.send({ content: 'a', components: [row]});


	}
};