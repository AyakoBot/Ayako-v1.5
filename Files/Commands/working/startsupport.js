module.exports = {
	name: 'startsupport',
	requiredPermissions: 0,
	Category: 'Owner',
	description: 'Start a Support Case',
	usage: 'h!startsupport',
/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) msg.reply('I need a Guild ID to start a Support Case in.');
		const guildid = args[0];
		let option = args[1] ? args[1] : 'none';
		const server = client.guilds.cache.get(guildid);
		let channel = client.channels.cache.get(server.systemChannelID);
		if (!channel) {
			const textchannels = server.channels.cache.filter((c) => c.type == 'text');
			channel = textchannels.first();
		}
		const inv = await channel.createInvite({maxAge: 20000, reason: 'Support Case Opened'}).catch(() => {});
		if (inv && inv.url) {
			if (option == 'none') {
				channel.send('Ayako Staff was invited. \nExpect <@318453143476371456>.');
			}
			msg.channel.send(inv.url);
		} else {
			msg.reply('Cannot create an Invite');
		}
	}
};
