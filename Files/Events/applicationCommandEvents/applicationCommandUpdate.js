const Discord = require('discord.js');

module.exports = {
	async execute(oldCommand, newCommand) {
		const client = oldCommand ? oldCommand.client : newCommand.client;
		const guild = oldCommand ? oldCommand.guild : newCommand.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.commandUpdate;
		const con = Constants.commandUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.commandEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.setAuthor(lan.author.name, con.author.image)
					.setColor(con.color);
				const ChangedKey = [];
				if (oldCommand.name !== newCommand.name) {
					ChangedKey.push(language.name);
					embed.addField(language.name, `${language.before}: \`${oldCommand.name}\`\n${language.after}: \`${newCommand.name}\``);
				}
				if (oldCommand.defaultPermission !== newCommand.defaultPermission) {
					ChangedKey.push(language.defaultPermission);
					embed.addField(language.defaultPermission, `${language.before}: \`${oldCommand.defaultPermission ? lan.isDefault : lan.isNotDefault}\`\n${language.after}: \`${newCommand.defaultPermission ? lan.isDefault : lan.isNotDefault}\``);
				}
				if (oldCommand.description !== newCommand.description) {
					ChangedKey.push(language.description);
					embed.addField(language.description, `${language.before}: \`${oldCommand.description}\`\n${language.after}: \`${newCommand.description}\``);
				}
				if (oldCommand.options !== newCommand.options) {
					ChangedKey.push(language.options);
					oldCommand.options = oldCommand.options.filter(o => !newCommand.options.includes(o));
					newCommand.options = newCommand.options.filter(o => !oldCommand.options.includes(o));
					oldCommand.options.forEach(o => {embed.addField(language.oldOptions, `${Discord.Util.escapeBold(language.type)}: ${Discord.Util.escapeInlineCode(language.command[o.type])}\n${language.name}: ${Discord.Util.escapeInlineCode(o.name)}\n${Discord.Util.escapeBold(language.description)}: ${Discord.Util.escapeInlineCode(o.description)}\n${o.required ? `${Discord.Util.escapeBold(language.required)}: ${Discord.Util.escapeInlineCode(o.required)}\n` : '', o.choices ? `${Discord.Util.escapeBold(language.choices)}: ${o.choices.map(e => `${Discord.Util.escapeInlineCode(e)}`)}` : ''}`);});
					newCommand.options.forEach(o => {embed.addField(language.newOptions, `${Discord.Util.escapeBold(language.type)}: ${Discord.Util.escapeInlineCode(language.command[o.type])}\n${language.name}: ${Discord.Util.escapeInlineCode(o.name)}\n${Discord.Util.escapeBold(language.description)}: ${Discord.Util.escapeInlineCode(o.description)}\n${o.required ? `${Discord.Util.escapeBold(language.required)}: ${Discord.Util.escapeInlineCode(o.required)}\n` : '', o.choices ? `${Discord.Util.escapeBold(language.choices)}: ${o.choices.map(e => `${Discord.Util.escapeInlineCode(e)}`)}` : ''}`);});
				}
				embed.setDescription(ch.stp(lan.description, {command: oldCommand ? oldCommand : newCommand})+ChangedKey.map(o => ` \`${o}\``));
				if (embed.fields.length > 0) ch.send(logchannel, embed);
			}
		}
	}
};