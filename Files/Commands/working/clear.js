const ms = require('ms');
const Discord = require('discord.js');

module.exports = {
	name: 'clear',
	Category: 'Moderation',
	aliases: ['prune', 'purge'],
	requiredPermissions: 4,
	description: 'Clears an amount of messages from a chat',
	usage: 'h!clear (user ID or mention) [amount]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const logchannel = client.channels.cache.get(logchannelid);
		let user = msg.mentions.users.first();
		let amount;
		if (!args[0]) return msg.reply('You need to specify an amount.');
		if (!user && args[0].length == 18) user = client.users.cache.get(args[0]);
		if (user) amount = args[1];
		if (!user) amount = args[0];
		if (isNaN(amount)) return msg.reply('Invalid amount.');
		if (!amount && !user) return msg.reply('You need to specify a user and an amount.');
		if (amount > 100) return msg.reply('The given amount has to be between 2 and 100');
		if (amount < 2) return msg.reply('The given amount has to be between 2 and 100');
		msg.delete();
		let oldmsgs;
		let newmsgs;
		const days = +Date.now() - +ms('14d');
		await msg.channel.messages.fetch({
			limit: amount,
		}).then(async (msgs) => {
			newmsgs = msgs;
			oldmsgs = msgs.filter(m => m.createdTimestamp > days);
			msgs = msgs.filter(m => m.createdTimestamp > days);
			if (user) {
				msgs = msgs.filter(m => m.author.id === user.id).array();
			}
			await msg.channel.bulkDelete(msgs).catch(() => {
				msg.reply('Something went wrong, I wasnt able to delete any messages.');
			});
		});
		if (oldmsgs.size !== newmsgs.size) {
			setTimeout(() => {
				msg.channel.send(`I was only able to delete ${oldmsgs.size} messages since ${+newmsgs.size - +oldmsgs.size} messages were older than 14 days`).then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch();
			}, 1000);
		} else {
			setTimeout(() => {
				msg.channel.send(text+' were deleted.').then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 5000);  }).catch();
			}, 1000);
		}
		let text;
		if (user) {text = `${oldmsgs.size} messages sent by ${user}`;}
		if (!user) {text = `${oldmsgs.size} messages`;}
		const clearLogEmbed = new Discord.MessageEmbed()
			.setTitle(oldmsgs.size + ' were deleted in '+ msg.channel.name)
			.setColor('ff0000')
			.setDescription(`${text} were deleted by ${msg.author}`)
			.setTimestamp()
			.setFooter('Executor user ID: '+msg.author.id+'\n');
		if (logchannel)logchannel.send(clearLogEmbed).catch(() => {});


        
	}};