const Discord = require('discord.js');

module.exports = {
	async execute(users, guild, r, member) {
		
		const language = await guild.client.ch.languageSelector(guild.id);
		const lan = language.commands.antiraidHandler;
		const con = guild.client.constants.antiraidMessage;
		const client = guild.client;
        
		if (r.posttof) sendDebugMessage();
		if (r.bantof) return ban();
		if (r.kicktof) return kick();
		
		function kick() {
			users.forEach(u => {
				const user = client.users.cache.get(u);
				const msg = new Object;
				msg.client = client, msg.author = client.user, msg.guild = guild, msg.lanSettings = language.commands.settings, msg.lan = msg.lanSettings.separators, msg.language = language;
				client.emit('antiraidKickAdd', client.user, user, language.autotypes.antiraid, msg);
			});
		}

		function ban() {
			users.forEach(u => {
				const user = client.users.cache.get(u);
				const msg = new Object;
				msg.client = client, msg.author = client.user, msg.guild = guild, msg.lanSettings = language.commands.settings, msg.lan = msg.lanSettings.separators, msg.language = language;
				client.emit('antiraidBanAdd', client.user, user, language.autotypes.antiraid, msg);
			});
		}

		function sendDebugMessage() {

			const embed = new Discord.MessageEmbed()
				.setAuthor(lan.debugMessage.author, con.author.image, con.author.link)
				.setColor(con.color)
				.setDescription(guild.client.ch.stp(lan.debugMessage.description, {user: member.user}) + '\n' + guild.ch.makeCodeBlock(users.map(u => u.id)));

			let content = '';
			let buttons = null;
			if (r.debugmode) {
				content += `\n${lan.debugMessage.question}`;
				const yes = new Discord.MessageButton()
					.setStyle('success')
					.setLabel(language.Yes)
					.setCustomId('antiraidHandler-YES');
				const no = new Discord.MessageButton()
					.setStyle('danger')
					.setLabel(language.No)
					.setCustomId('antiraidHandler-NO');
				buttons = client.ch.buttonRower([[yes, no]]);
			}

			const channel = client.channels.cache.get(r.postchannel);
			if (channel) {
				const roles = r.pingroles.map(role => `<@&${role}>`);
				const users = r.pingroles.map(user => `<@&${user}>`);
				client.ch.send({embed: [embed], content: `${roles}\n${users}${content}`, components: buttons});
			}
		}
	}
};