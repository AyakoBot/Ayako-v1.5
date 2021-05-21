module.exports = {
	name: 'tta',
	requiredPermissions: 0,
	description: 'Adds something to the To-Do list of the Ayako Bot Dev\nTTA stands for "Things to add"',
	usage: 'h!tta [task]',
	Category: 'Owner',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const tta = args.slice(0).join(' ');
		client.channels.cache.get('706691541833351171').send(tta);
		setTimeout(() => {
			try {
				msg.delete();
			} catch(error) {console.log('Couldnt delete TTA');}
		}, 1);
		msg.reply(`Added \`${tta}\` to your to-do list`).then(send => { setTimeout(function(){  send.delete();  }, 5000);  }).catch();
	}};