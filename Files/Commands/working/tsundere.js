const Discord = require('discord.js');
module.exports = {
	name: 'tsundere',
	Category: 'Fun',
	cooldown: 10,
	description: 'Displays a random Tsundere Quote',
	usage: 'h!tsundere',
	DMallowed: 'Yes',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */

        
		var random = Math.round(Math.random() * 24);
		let tsunText = '';
		if (random == 0) {tsunText = 'B-Baka!';}
		if (random == 1) {tsunText = 'I\'m not a tsundere.';}
		if (random == 2) {tsunText = 'Makise Kurisou';}
		if (random == 3) {tsunText = 'Urusai, urusai, urusai!!';}
		if (random == 4) {tsunText = 'I\'m not cute!!';}
		if (random == 5) {tsunText = 'ANTA BAKA';}
		if (random == 6) {tsunText = 'I hate you';}
		if (random == 7) {tsunText = 'What are you, stupid?';}
		if (random == 8) {tsunText = 'N-No, it\'s not like I did it for you! I did it because I had freetime, that\'s all!" ┐(￣ヘ￣;)┌';}
		if (random == 9) {tsunText = 'I like you, you idiot!';}
		if (random == 10) {tsunText = 'BAKAAAAAAAAAAAAAAA!!!!! YOU\'RE A BAKAAAAAAA!!!!';}
		if (random == 11) {tsunText = 'I\'m just here because I had nothing else to do!';}
		if (random == 12) {tsunText = 'Are you stupid?';}
		if (random == 13) {tsunText = 'You\'re such a slob!';}
		if (random == 14) {tsunText = 'You\'re free anyways, right?';}
		if (random == 15) {tsunText = 'You should be grateful!';}
		if (random == 16) {tsunText = 'Don\'t misunderstand, it\'s not like I like you or anything...';}
		if (random == 17) {tsunText = '....T-Thanks.....';}
		if (random == 18) {tsunText = 'H-Hey...." (//・.・//)';}
		if (random == 19) {tsunText = 'T-Tch! S-Shut up!';}
		if (random == 20) {tsunText = 'I just had extra, so shut up and take it!';}
		if (random == 21) {tsunText = 'Can you be ANY MORE CLUELESS?';}
		if (random == 22) {tsunText = 'HEY! It\'s a privilege to even be able to talk to me! You should be honored!';}
		if (random == 23) {tsunText = 'Geez, stop pushing yourself! You\'re going to get yourself hurt one day, you idiot!';}
		if (random == 24) {tsunText = 'Grrrr';}
		const tsunEmbed = new Discord.MessageEmbed()
			.setDescription(tsunText)
			.setColor('#b0ff00');
		msg.channel.send(tsunEmbed);
        
	}};
