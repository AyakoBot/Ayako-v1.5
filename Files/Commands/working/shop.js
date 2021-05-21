const Discord = require('discord.js');
module.exports = {
	name: 'shop',
	ThisGuildOnly: ['298954459172700181', '266632338883084290'],
	description: 'Display the Server Shop',
	usage: 'h!shop',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.guild.id == '298954459172700181') {
			const shopEmbed = new Discord.MessageEmbed()
				.setTitle('Shop')
				.addFields(
					{name:'**#1 - 15000<a:NadekoFlower:746420831390793899>**', value:'<@&330766391999463424>', inline: true},
					{name:'**#2 - 10000<a:NadekoFlower:746420831390793899>**', value:'<@&358778201868075008>', inline: true},
					{name:'**#3 - 5000<a:NadekoFlower:746420831390793899>**', value:'<@&332858829706362882>', inline: true},
					{name:'**#4 - 500<a:NadekoFlower:746420831390793899>**', value:'<@&389601915958198283>', inline: true},
					{name:'**#5 - 200<a:NadekoFlower:746420831390793899>**', value:'<@&349652217885622273>', inline: true},
					{name:'\u200b', value:'\u200b', inline: false},
					{name:'https://top.gg/bot/nadeko/vote', value:'Earn Flowers by voting for Nadeko', inline: false},
				)
				.setDescription('Send payment to a <@&360469415612907522> Member\n\n**For automatic role assignment type in this pattern: \n\n`.give [amount] [<@&360469415612907522> member] [role name]`**\n Example: | .give 500 <@267835618032222209> Kawaii Potato |\n')
				.setColor('#b0ff00')
				.setFooter('If it doesnt work for some reason, wait for the Staff to reply');
			msg.channel.send(shopEmbed);
		} else if (msg.guild.id == '266632338883084290') {
			const aaaa = new Discord.MessageEmbed()
				.setAuthor('Server Role Shop', 'https://www.lol.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setColor('b0ff00')
				.setDescription('To buy these Roles visit `t!shop` number `3` i. e. `Server Shop`\n View this message anytime by typing `h!shop`')
				.addFields(
					{name: '2.500 <a:TatsuCoins:800684425582477392>', value: '<@&800159175836827719> <a:DogDance:800685678958608404> ', inline: true},
					{name: '2.500 <a:TatsuCoins:800684425582477392>', value: '<@&800157887611404298> <:FoxLove:750155509348302960> ', inline: true},
					{name: '2.500 <a:TatsuCoins:800684425582477392>', value: '<@&800119007427428381> <:BunnyLove:800685882533085195> ', inline: true},
					{name: '2.500 <a:TatsuCoins:800684425582477392>', value: '<@&800160316884516896> <a:RainbowCat:800685849246957578> ', inline: true},
					{name: '2.500 <a:TatsuCoins:800684425582477392>', value: '<@&800425649084694538> <:mikuSleepy:726249050575208558>', inline: true},
					{name: '\u200b', value: '\u200b', inline: false},
				)
				.addField('How to get Tatsu Server Coins', 'Just be active in chat, you get 5 Server Coins per message', false);
			msg.channel.send(aaaa);
		}
	}};