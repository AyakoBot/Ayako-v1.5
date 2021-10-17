module.exports = {
	async execute(msg) {
		if (['886648527910998056', '769649822314659861', '805266459356954714'].includes(msg.channel.id)) {
			msg.channel.threads.create({
				startMessage: msg,
				name: msg.content,
			});
		}
		if (msg.channel.id == '898391533005459476' && msg.author.id == '204255221017214977') {
			msg.channel.threads.create({
				startMessage: msg,
				name: msg.embeds[0].split(/\n+/)[0].slice(2, -2),
			});
		}
	} 
};