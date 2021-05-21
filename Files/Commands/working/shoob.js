const Discord = require('discord.js');
module.exports = {
	name: 'shoob',
	ThisGuildOnly: ['298954459172700181'],
	description: 'Show the shoob Role reward Info',
	usage: 'h!shoob',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const shopEmbed = new Discord.MessageEmbed()
			.setTitle('Shoob Roles')
			.addFields(
				{name:'**#1 - 5000 Cards <:Shoob1:756575974794985492>**', value:'<@&756597282891366434>', inline: true},
				{name:'**#2 - 1000 Cards <:Shoob2:756575919488892928>**', value:'<@&756597164850806896> ', inline: true},
				{name:'**#3 - 500 Cards <:Shoob3:756573139831488562>**', value:'<@&756332260805967882>', inline: true},
				{name:'**#4 - 100 Cards <:Shoob4:756572538787725385>**', value:'<@&756331587616112660>', inline: true},
				{name:'**#5 - 50 Cards**', value:'<@&756331367561822258>', inline: true},
				{name:'**#6 - 20 Cards**', value:'<@&755962444547096677>', inline: true},
			
				{name:'\u200b', value:'\u200b', inline: false},
				{name:'Get Cards by chatting in this server and claiming cards in  ', value:'<#756502435572219915>', inline: false},
				{name:'\u200b', value:'**Visit https://animesoul.com/ for trading and more!** \nAlso Mark Alycans (https://animesoul.com/user/77256980288253952) \nas referrer (the green button on the banner).', inline: false}
			)
			.setDescription('Claim cards by sending `claim [captcha code]`. \nYou can see the **Captcha Code** below the spawned cards\n')
			.setColor('#b0ff00')
			.setFooter('Every Shoob Role gives you access to Giveaways');
		msg.channel.send(shopEmbed);
	}};