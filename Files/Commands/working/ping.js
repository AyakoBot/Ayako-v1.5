module.exports = {
	name: 'ping',
	Category: 'Info',
	DMallowed: 'Yes',
	description: 'Calculate Ayakos latency',
	usage: 'h!ping',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		msg.channel.send('🏓​⠀').then(m =>{
			let ping;
			if (msg._edits.length > 0) {
				ping = m.createdTimestamp - msg.editedTimestamp;
			} else {
				ping = m.createdTimestamp - msg.createdTimestamp;
			}
			m.edit(`🏓 \n**Response Time: **${ping}ms`);
			msg.react('🏓');
		});
	}
};