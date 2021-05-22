const { client } = require('./Files/BaseClient/DiscordClient.js');
client.ch = require('./Files/BaseClient/ClientHelper.js');
client.ch.pathCheck();
//const { AP } = require('./Files/BaseClient/DBL');

// eslint-disable-next-line no-undef
process.setMaxListeners(2);

for (const rawevent of [...client.events.entries()]) {
	const event = client.events.get(rawevent[0]);
	if (event.once) client.once(rawevent[0], (...args) => event.execute(...args));
	else client.on(rawevent[0], (...args) => event.execute(...args));
}

// eslint-disable-next-line no-undef
process.on('unhandledRejection', (error) => {client.ch.logger('Unhandled Rejection', error);});
// eslint-disable-next-line no-undef
process.on('TypeError', (error) => {client.ch.logger('Type Error', error);});
//AP.on('posted', () => {console.log('Posted stats to Top.gg!')})