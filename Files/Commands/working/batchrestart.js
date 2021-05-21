const Discord = require('discord.js');
module.exports = {
	name: 'batchrestart',
	Category: 'Owner',
	requiredPermissions: 0,
	description: 'Quit Ayako\'s Batchfile and force a restart',
	usage: 'h!batchrestart',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const RestartEmbed = new Discord.MessageEmbed()
			.setTitle('Bot restart')
			.setTimestamp()
			.setColor('#b0ff00')
			.setFooter('Executed by '+ msg.author.id);
		msg.channel.send('Restarting... <a:loading:399267255839490051>');
		client.user.setActivity('Bot restarting', { type: 'WATCHING' }).catch(console.error)
			.then(() => console.log('destroying process'))
			.then(() => client.channels.cache.get('731421877276508170').send(RestartEmbed))
		/* eslint-disable */
            .then(() => process.exit());
        /* eslint-enable */
	}};