module.exports = {
	name: 'endsupport',
	requiredPermissions: 0,
	Category: 'Owner',
	description: 'End a Support Case',
	usage: 'h!endsupport',
/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) return msg.reply('I need an Invite URL to close the Support Case');
		const invitecode = args[0];
		const invite = await client.fetchInvite(invitecode);
		const m = await	msg.channel.send('<a:Loading:780543908861182013> Support Case Closed.\n<a:Loading:780543908861182013> Deleted generated Invite.\n<a:Loading:780543908861182013> Removed Ayako Staff from Server.');
		await invite.delete({reason: 'Support Case Finished'});
		m.edit('<a:Loading:780543908861182013> Support Case Closed.\n<:tick:670163913370894346> Deleted generated Invite.\n<a:Loading:780543908861182013> Removed Ayako Staff from Server.');
		const Lars = client.users.cache.get('318453143476371456');
		await msg.guild.member(Lars).kick('Support Case Finished').catch(() => {});
		m.edit('<:tick:670163913370894346> Support Case Closed.\n<:tick:670163913370894346> Deleted generated Invite.\n<:tick:670163913370894346> Removed Ayako Staff from Server.');
	}
};
