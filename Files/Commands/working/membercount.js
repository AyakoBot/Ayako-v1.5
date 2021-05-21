module.exports = {
	name: 'membercount',
	Category: 'Info',
	description: 'Displays the current membercount of the server',
	usage: 'h!membercount',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const Cmembers = msg.guild.memberCount;
		msg.channel.send(`This guild currently has ${Cmembers} members`);
	}};