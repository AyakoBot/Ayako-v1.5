const Discord = require('discord.js');

module.exports = {
	name: 'memberstatus',
	Category: 'Info',
	description: 'Count all Statuses of all Members of your server',
	usage: 'h!memberstatus',
/* eslint-disable */
  async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
	/* eslint-enable */
	return msg.channel.send('Command unavailable due to missing intents');
		const online = msg.guild.members.cache.filter(member => member.user.presence.status == 'online');
		let isStreaming = [];
		await online.forEach(async (o) => {
			await msg.guild.member(o).presence.activities.forEach(a => {
				if (a.type == 'STREAMING') isStreaming.push(o);
			});
		});
		const idle = msg.guild.members.cache.filter(member => member.user.presence.status == 'idle');
		const dnd = msg.guild.members.cache.filter(member => member.user.presence.status == 'dnd');
		const offline = msg.guild.members.cache.filter(member => member.user.presence.status == 'offline');
		const streaming = isStreaming;
		const notoffline = msg.guild.members.cache.filter(member => member.user.presence.status !== 'offline');
		const onlineBots = online.filter(member => member.user.bot == true);
		const onlineUser = online.filter(member => member.user.bot == false);
		const idleBots = idle.filter(member => member.user.bot == true);
		const idleUser = idle.filter(member => member.user.bot == false);
		const dndBots = dnd.filter(member => member.user.bot == true);
		const dndUser = dnd.filter(member => member.user.bot == false);
		const offlineBots = offline.filter(member => member.user.bot == true);
		const offlineUser = offline.filter(member => member.user.bot == false);
		const streamingBots = streaming.filter(member => member.user.bot == true);
		const streamingUser = streaming.filter(member => member.user.bot == false);
		const notofflineBots = notoffline.filter(member => member.user.bot == true);
		const notofflineUser = notoffline.filter(member => member.user.bot == false);
		const serverembed = new Discord.MessageEmbed()
			.setAuthor('Ayako Member Screening', 'https://www.ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.setColor('b0ff00')
			.setDescription('This function is unavaliable due to missing Pressence Intent')
			.addFields(
				{ name: 'Users', value: `${+online.size - +streaming.length} Online\n${idle.size} Idle\n${dnd.size} Do not disturb\n${streaming.length} Streaming\n${offline.size} Offline\n${msg.guild.memberCount} Total`, inline: true },
				{ name: 'Total Online Members\n<:online:313956277808005120> <:idle:705332972295028839> <:dnd2:464520569560498197><:streaming2:464520569778601985>', value: `${notofflineUser.size} Humans\n${notofflineBots.size} Bots\n${notoffline.size} Total`, inline: true},
				{ name: 'Members Online\n<:online:313956277808005120>', value: `${onlineUser.size} Humans\n${onlineBots.size} Bots\n${+online.size - +streaming.length} Total`, inline: true},
				{ name: 'Members Idle\n<:idle:705332972295028839>', value: `${idleUser.size} Humans\n${idleBots.size} Bots\n${idle.size} Total`, inline: true},
				{ name: 'Members DND\n<:dnd2:464520569560498197>', value: `${dndUser.size} Humans\n${dndBots.size} Bots\n${dnd.size} Total`, inline: true},
				{ name: 'Members Offline\n<:offline:313956277237710868>', value: `${offlineUser.size} Humans\n${offlineBots.size} Bots\n${offline.size} Total`, inline: true},
				{ name: 'Members Streaming\n<:streaming2:464520569778601985>', value: `${streamingUser.length} Humans\n${streamingBots.length} Bots\n${streaming.length} Total`, inline: true},
			);
		msg.channel.send(serverembed);
	}
};
