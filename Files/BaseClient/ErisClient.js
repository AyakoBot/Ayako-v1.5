const Eris = require('eris');
const auth = require('./auth.json');

const bot = new Eris(`Bot ${auth.token}`, {
	disableEvents: true,
	maxShards: 'auto',
});

bot.connect().then(() => {
	console.log('| Eris Client connected at '+ new Date().toUTCString());
});

module.exports = { bot };