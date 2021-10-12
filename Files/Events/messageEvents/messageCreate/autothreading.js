module.exports = {
	async execute(msg) {
		if (['886648527910998056', '769649822314659861', '805266459356954714'].includes(msg.channel.id)) {
			msg.channel.threads.create({
				startMessage: msg,
				name: msg.content,
			});
		} 
	} 
};