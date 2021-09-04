module.exports = {
	async execute(reaction) {
		const client = reaction.client;
		const ch = client.ch;
		ch.logger('A Reaction Emoji was removed', reaction); //Logging output since I was unable to determine when this Event fires
	}
};