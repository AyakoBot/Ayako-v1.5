const Discord = require('discord.js');
module.exports = {
	name: 'deathcountdown',
	description: 'A very mysterious count down, what will happen when it ends?',
	DMallowed: 'Yes',
	usage: 'h!deathcountdown',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		var dateFns = require('date-fns');
		var x = new Date();
		var y = new Date(2027, 11, 31, 12, 0);
		var temp;
		temp = dateFns.differenceInYears(y, x);
		var result = temp + ' years ';
		x = dateFns.addYears(x, temp);
		temp = dateFns.differenceInMonths(y, x);
		result = result + temp + ' months ';
		x = dateFns.addMonths(x, temp);
		temp = dateFns.differenceInDays(y, x);
		result = result + temp + ' days ';
		x = dateFns.addDays(x, temp);
		temp = dateFns.differenceInHours(y, x);
		result = result + temp + ' hours ';
		x = dateFns.addHours(x, temp);
		temp = dateFns.differenceInMinutes(y, x);
		result = result + temp + ' minutes ';
		x = dateFns.addMinutes(x, temp);
		temp = dateFns.differenceInSeconds(y, x);
		let Gresult = result + temp + ' seconds';


		var Co2Embed = new Discord.MessageEmbed()
			.addFields(
				{ name: 'Time left', value: `${Gresult}` }
			);
		setTimeout(() => {
			msg.delete();
		}, 1);
		msg.channel.send(Co2Embed);
	}};