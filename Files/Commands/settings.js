const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'settings',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	async exe(msg) {
		const settings = new Discord.Collection();
		const settingsFiles = fs.readdirSync('./Files/Commands/settings').filter(file => file.endsWith('.js'));
		for (const file of settingsFiles) {
			const settingsfile = require(`./settings/${file}`);
			settingsfile.name = file.replace('.js', '');
			settings.set(file.replace('.js', ''), settingsfile);
		}
		if (!msg.args[0]) {
            const interactionsmodeRes = await msg.client.ch.query(`SELECT * FROM interactionsmode WHERE guildid = '${msg.guild.id}';`);
            const prefixRes = await msg.client.ch.query(`SELECT * FROM prefix WHERE guildid = '${msg.guild.id}';`);
            const muteroleRes = await msg.client.ch.query(`SELECT * FROM muterole WHERE guildid = '${msg.guild.id}';`);
            const Res = await msg.client.ch.query(`SELECT * FROM interactionsmode WHERE guildid = '${msg.guild.id}';`);

			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.overview.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.overview.desc, {prefix: msg.client.constants.standard.prefix, commands: settings.map(s => ` \`${s.name}\``)}))
                //.addFields(
                 //   {name: msg.language.prefix, value: }
                //)

            msg.client.ch.reply(msg, embed);
		}
	}
};