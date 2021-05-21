const Discord = require('discord.js');
module.exports = {
	name: 'softwarn',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Softwarns a user\nSoftwarns are not saved in any way, this command is recommended for delivering official Server messages into User DM\'s',
	usage: 'h!softwarn [user ID or mention] [reason]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		let user = client.users.cache.get(args[0].replace(/\D+/g, ''));
		if (!user || !user.id) {
			user = msg.mentions.users.first();
		}
		if (!user || !user.id) return msg.reply('You need to mention a user.');
		const guildmember = msg.guild.member(user);
		if (guildmember) {
			if (+msg.guild.member(msg.author).roles.highest.rawPosition < +guildmember.roles.highest.rawPosition || +msg.guild.member(msg.author).roles.highest.rawPosition == +guildmember.roles.highest.rawPosition) {
				msg.reply('You cant warn this user.');
				return;
			}
		}
		const DM = await user.createDM().catch(() => {
			msg.reply('I was not able to send a DM to this user.');
			return;
		});
		const Reason = args.slice(1).join(' ');
		if (!Reason) return msg.reply('You need to provide a reason');
		const embed = new Discord.MessageEmbed()
			.setDescription(Reason)
			.setColor('YELLOW')
			.setTitle('You have been Softwarned on '+msg.guild.name)
			.setFooter('This Softwarn is not saved in any way');
		await DM.send(embed).catch(() => {
			msg.reply('I was not able to send a DM to this user.');
			return;
		});
		const logchannel = client.channels.cache.get(logchannelid);
		const logembed = new Discord.MessageEmbed()
			.setDescription(`${msg.author} softwarned ${user}`)
			.setFooter(`Executor user ID: ${msg.author.id}\nSoftwarned user ID: ${user.id}`)
			.setThumbnail(user.displayAvatarURL())
			.addField('Reason', Reason)
			.setColor('YELLOW')
			.setTimestamp();
		if (logchannel) logchannel.send(logembed);
		const ReplyEmbed = new Discord.MessageEmbed()
			.setDescription(`${user} was Softwarned.`)
			.setColor('YELLOW')
			.setTimestamp();
		msg.channel.send(ReplyEmbed).catch(() => {});
	}
};