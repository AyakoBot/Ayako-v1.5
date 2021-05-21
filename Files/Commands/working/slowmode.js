const Discord = require('discord.js');
module.exports = {
	name: 'slowmode',
	requiredPermissions: 4,
	Category: 'Moderation',
	description: 'Apply a slowmode to a channel',
	usage: 'h!slowmode (channel ID or mention) [slowdown in seconds]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        if (!args[0]) return msg.reply('You need to enter a valid time in seconds -> `h!slowmode {channel ID or mention} [time in seconds]`.')
        let entry = args[0];
        if (entry.length == 18) {
            const channel = msg.guild.channels.cache.get(entry);
            if (channel && channel.id) {
                const time = args[1];
                DchannelF(channel, time)
                return;
            } else {
                msg.reply('You need to enter a valid id or mention -> `h!slowmode {channel ID or mention} [time in seconds]`');
                return;
            }
        } else if (entry.length == 21) {
            if (entry.includes('<#') && entry.includes('>')) {
                let channel = msg.guild.channels.cache.get(entry.replace(/<#/g, '').replace(/>/g, ''));
                const time = args[1];
                DchannelF(channel, time)
                return;
            } else {
                msg.reply('You need to enter a valid id or mention -> `h!slowmode {channel ID or mention} [time in seconds]`');
                return;
            }
        } else {
            const channel = msg.channel;
            const time = args[0];
            DchannelF(channel, time);
        }
        function DchannelF(channel, time) {
            if (!channel) {
                msg.reply('You need to enter a valid id or mention -> `h!slowmode {channel ID or mention} [time in seconds]`');
                return;
            }
			const logchannel = client.channels.cache.get(logchannelid);   
			if (!time) return msg.reply('You need to enter a valid time in seconds -> `h!slowmode {channel ID or mention} [time in seconds]`.');
			if (isNaN(time)) return msg.reply('The time you entered was not a number -> `h!slowmode {channel ID or mention} [time in seconds]`.');
			channel.edit({rateLimitPerUser: time}).catch(() => {msg.reply('I dont have enough permissions to do that');});
			const reply = new Discord.MessageEmbed()
				.setDescription(`${channel} now has a ${time} second cooldown`)
				.setColor('b0ff00');
			msg.channel.send(reply).catch(() => {});
			const logEmbed = new Discord.MessageEmbed()
				.setTitle(msg.author.username + ' applied slowmode to  '+ channel.name)
				.setColor('YELLOW')
				.setThumbnail(msg.author.displayAvatarURL())
				.setDescription(`${msg.author} applied a ${time} second slowmode to ${channel}`)
				.setTimestamp()
				.setFooter('Executor user ID: '+msg.author.id+'');
			if (logchannel) logchannel.send(logEmbed).catch(() => {});
        }}};