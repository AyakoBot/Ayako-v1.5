
const moment = require('moment');
require('moment-duration-format');
module.exports = {
	name: 'uptime',
	Category: 'Info',
	description: 'Displays the current uptime of Ayako',
	usage: 'h!uptime',
	DMallowed: 'Yes',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const duration = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
		msg.reply(`I am online since \`${duration}\``);
	}};