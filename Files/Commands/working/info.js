const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
module.exports = {
	name: 'info',
	Category: 'Info',
	DMallowed: 'Yes',
	description: 'Displays information about Ayako',
	usage: 'h!info',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		const duration = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
		const processVersion = process.version;
		const nodeVersion = process.versions.node;
		const modules = process.versions.modules;
		const arch = process.arch;
		const env = process.env.LOGONSERVER;
		const Processors = process.env.number_of_processors;
		/* eslint-enable */


		const InfoEmbed = new Discord.MessageEmbed()
			.setColor('#b0ff00')
			.setTitle('Bot Info')
			.setThumbnail(client.user.displayAvatarURL())
			.setDescription('Special thanks to:\n<@267835618032222209> For making the best Ayako Emotes https://www.patreon.com/classicbento.\n<@529804646030770178> For drawing the Ayako Avatar\nhttps://www.instagram.com/fuyurein/\nhttps://twitter.com/fuyurein?s=09\n ♡♡♡ Thank you for your help!')
			.setAuthor('Ayako', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576397942&scope=bot')
			.addFields(
				{ name: 'Bot Info', value:'\u200b' },
				{ name: '|Language', value:'English', inline: true },
				{ name: '|Bot Version', value:'1.4', inline: true },
				{ name: '|Programming Language', value:'JavaScript', inline: true },
				{ name: '|Owner', value:'Lars_und_so#0666', inline: true },
				{ name: '|Guild size:', value:client.guilds.cache.size, inline: true },
				{ name: '|Total user count', value:client.users.cache.size, inline: true },
				{ name: '\u200b', value:'\u200b' },
				{ name: 'More Info', value:'\u200b' },
				{ name: '|Process Version', value:processVersion, inline: true },
				{ name: '|Node Version', value:nodeVersion, inline: true },
				{ name: '|Modules', value:modules, inline: true },
				{ name: '|Arch', value:arch, inline: true },
				{ name: '|Log On Server', value:env, inline: true },
				{ name: '|Assigned Processors', value:Processors, inline: true },


			)
			.setFooter(`Uptime: ${duration}`)
			.setTimestamp();
		msg.channel.send(InfoEmbed);
	}};