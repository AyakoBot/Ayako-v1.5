const ch = require('../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(reaction) {
		ch.logger('A Reaction Emoji was removed', reaction); //Logging output since I was unable to determine when this Event fires
	}
};