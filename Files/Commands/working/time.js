
const Discord = require('discord.js');
const moment = require('moment');
module.exports = {
	name: 'time',
	Category: 'Info',
	DMallowed: 'Yes',
	description: 'Displays the current GMT/UTC Time',
	usage: 'h!time',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		var time = moment().utcOffset(0).format('h:mm:ss a');
		const TimeEmbed = new Discord.MessageEmbed()
			.setTitle(`Current GMT/UTC time: ${time}`)
			.setTimestamp()
			.setColor('#b0ff00');
		msg.channel.send(TimeEmbed);
	}};