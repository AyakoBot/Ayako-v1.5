module.exports = {
	name: 'ads', 
	description: 'Tells people where ads go', 
	ThisGuildOnly: ['298954459172700181'],
	usage: 'h!ads',
	cooldown: 10000,
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		msg.channel.send('You can advertise almost everything in <#299942755453370371>\nStick to the Channel and Server Rules!').then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
		msg.delete({ timeout: 10000 });
	}
};