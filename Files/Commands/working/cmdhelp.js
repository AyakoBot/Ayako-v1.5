const Discord = require('discord.js');

module.exports = {
	name: 'cmdhelp',
	Category: 'Info',
	description: 'Show how the specified command works',
	usage: 'h!cmdhelp [command name]',
	aliases: ['cmdh', 'commandhelp', 'commandh'],
/* eslint-disable */
  async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		const commandName = args[0] ? args[0].toLowerCase() : 'help';
		const reqcommand = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!reqcommand || !reqcommand.name) return msg.reply('That was not a valid Command.');
		const category = reqcommand.Category ?  reqcommand.Category : 'none';
		let reqperms = reqcommand.requiredPermissions ? reqcommand.requiredPermissions : 'none';
		if (reqperms == 0) {
			reqperms = reqperms+' - Ayako Owner';
		} else if (reqperms == 1) {
			reqperms = reqperms+' - Administrator';
		} else if (reqperms == 2) {
			reqperms = reqperms+' - Manage Guild';
		} else if (reqperms == 3) {
			reqperms = reqperms+' - Manage Roles or Manage Channel';
		} else if (reqperms == 4) {
			reqperms = reqperms+' - Ban Members or Kick Members or Manage Messages';
		} else if (reqperms == 5) {
			reqperms = reqperms+' - Manage Nicknames';
		} else if (reqperms == 6) {
			reqperms = 'none';
		}
		const ThisGuildOnly = [];
		if (reqcommand.ThisGuildOnly) {
			for (let i = 0; i < reqcommand.ThisGuildOnly.length; i++) {
				const guild = client.guilds.cache.get(reqcommand.ThisGuildOnly[i]);
				let tgo = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : undefined;
				if (!tgo) {
					let channel = client.channels.cache.get(guild.systemChannelID);
					if (!channel) {
						const textchannels = guild.channels.cache.filter((c) => c.type == 'text');
						channel = textchannels.first();
					}
					const inv = await channel.createInvite({maxAge: 20000, reason: `command specific help command used on ${msg.guild.name} / ${msg.channel.name}`});
					tgo = inv.url;
				}
				if (tgo) {
					ThisGuildOnly.push(`[${guild.name}](${tgo})`);
				} else {
					ThisGuildOnly.push(`${guild.name}`);
				}
			}
		}
		const aliases = reqcommand.aliases ? reqcommand.aliases.map((t) => `\`h!${t}\``).join(', ') : 'none';
		const embed = new Discord.MessageEmbed()
			.setAuthor(`Command: ${reqcommand.name}`, 'https://www.ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.addFields(
				{name: '|Name', value: `\u200b${reqcommand.name}`, inline: true},
				{name: '|Aliases', value: `\u200b${aliases}`, inline: true},
				{name: '|Category', value: `\u200b${category}`, inline: true},
				{name: '|Description', value: `\u200b${reqcommand.description}`, inline: false},
				{name: '|Usage', value: `\u200b\`${reqcommand.usage}\`\n\`\`\`[ ] = required\n( ) = optional\`\`\``, inline: false},
				{name: '|Required Permission Level', value: `\u200b${reqperms}`, inline: false},
				{name: '|This Guild Only', value: `\u200b${`${ThisGuildOnly.map(r => `${r}`).join(', ')}` !== '' ? ThisGuildOnly.map(r => `${r}`).join(', ') : 'Free to access'}`, inline: false},
			)
			.setColor('b0ff00')
			.setTimestamp();
		msg.channel.send(embed);
	}
};