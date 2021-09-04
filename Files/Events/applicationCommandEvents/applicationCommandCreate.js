const Discord = require('discord.js');

module.exports = {
	async execute(command) {
		const client = command.client;
		const guild = command.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.commandCreate;
		const con = Constants.commandCreate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.commandEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.setAuthor(lan.author.name, con.author.image)
					.setColor(con.color)
					.setDescription(ch.stp(lan.description, {command: command}))
					.addField(language.defaultPermission, command.defaultPermission ? lan.isDefault : lan.isNotDefault);
				if (command.description) embed.addField(language.description, Discord.Util.cleanCodeBlockContent(command.desciption));
				ch.send(logchannel, embed);
			}
		}
	}
};