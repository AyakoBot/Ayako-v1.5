const Discord = require('discord.js');
module.exports = {
	name: 'staffguide',
	description: 'Display an easy Staff Guide for new Moderators on your server',
	usage: 'h!staffguide',
	/* eslint-disable */
	execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		const embed = new Discord.MessageEmbed()
			.setAuthor('Easy Ayako Staff Guide', 'https://cdn.discordapp.com/attachments/760152457799401532/813219032802525204/pngfind.com-gavel-png-348962.png', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.setColor('b0ff00')
			.setDescription('Easy way to help new Staff Members around the bot\n\n`{ }` = optional\n`[ ]` = required')
			.addFields(
				{name: '**Bans and Kicks**', value: '`h!ban [user] {reason}` Bans a User from the server\n`h!kick [user] {reason}` Kicks a User from the server\n`h!unban [user]` Unbans a User from the server\n', inline: false },
				{name:'**Mutes**', value:'`h!tempmute [user] [duration] {reason}` Applies the mute role to a User for a the given time\n`h!unmute [user]` Removes the mute role from a User', inline: false },
				{name: '**Warns**', value: '`h!warn [user] {reason}` Warns a User\n`h!check [user]` Check all punishments a User had\n`h!edit [User] [option] [punishment ID] [new reason]` Edit a Users punishment reason of a punishment\n`h!pardon [user] [punishment ID] {reason}` Remove a Users punishment', inline: false },
				{name: '**Misc**', value: '`h!announce [channel] [text]` Send an important message to a channel\n`h!clear {user} [amount]` Clear messages of a chat either with or without User\n`h!addrole [hex color code] [role name]` Create a new Role with standard permissions\n`h!slowmode {channel} [time in seconds]` applies a cooldown to a channel, if no channel is given it applies the cooldown to the channel the command was executed in', inline: false },
				{name: '**Parameters**', value: '`[user]` User ID or Mention\n`[reason]` The Reason of the action\n`[duration]` The duration, examples: `30s 20m 3h 4d` s = seconds, m = minutes, h = hours, d = days\n`[punishment ID]` Can be found in `h!check [user]`\n`[hex color code]` A valid hex color code, can be found ([here](https://htmlcolorcodes.com/color-picker/)) or `random`', inline: false },
			)
			.setTimestamp();
		msg.channel.send(embed);
	}
};