const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		let deleteTimeout = 0;
		if (msg.source == 'antivirus') {
			deleteTimeout = msg.r.delete;
			const m = await msg.m.fetch();
			const embed = new Discord.MessageEmbed();
			const field = m.embeds[0].fields.pop();
			embed.setDescription(field.value);
			embed.setColor(m.embeds[0].color);
			setTimeout(() => msg.m.edit({ embeds: [embed] }).catch(() => { }), deleteTimeout);
		}
        
	}
};