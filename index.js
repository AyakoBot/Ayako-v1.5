const { client } = require('./Files/BaseClient/DiscordClient.js');
client.ch = require('./Files/BaseClient/ClientHelper.js');
client.ch.pathCheck();
//const { AP } = require('./Files/BaseClient/DBL');

// eslint-disable-next-line no-undef
process.setMaxListeners(2);

//Discord Info events


//client.on('debug', (log) => {console.log(log);});

client.on('error', (error) => {
	client.ch.logger('Discord Client\'s WebSocket encountered a connection error', error);
});
client.on('invalidated', () => {
	console.error('Discord Client was invalidated!');
});
client.on('rateLimit', (rateLimitInfo) => {
	client.ch.logger('Discord Client was RateLimited', `Timeout: ${rateLimitInfo.timeout}\nLimit: ${rateLimitInfo.limit}\nMethod: ${rateLimitInfo.method}\nPath: ${rateLimitInfo.path}\nRoute: ${rateLimitInfo.route}`);
});
client.on('shardDisconnect', (event, id) => {
	client.ch.logger(`Discord Client Shard with ID ${id} was Disconnected!`, event);
});
client.on('shardError', (error, shardID) => {
	client.ch.logger(`Discord Client Shard with ID ${shardID} has enountered an Error!`, error);
});
client.on('shardReady', (id, unavailableGuilds) => {
	if (unavailableGuilds) {
		client.ch.logger(`Discord Client Shard with ID ${id} is Ready. Unavailable Guilds:`, unavailableGuilds);
	} else {
		client.ch.logger(`Discord Client Shard with ID ${id} is Ready.`);
	}
});
client.on('shardReconnecting', (id) => {
	client.ch.logger(`Discord Client Shard with ID ${id} is Reconnecting.`);
});
client.on('shardResume', (id, replayedEvents) => {
	client.ch.logger(`Discord Client Shard with ID ${id} is now Resuming.`, replayedEvents+' replayed Events');
});
client.on('warn', (err, id) => {
	client.ch.logger(`Discord Client Shard with ID ${id} recieved a warning`, err);
});

for (const rawevent of [...client.events.entries()]) {
	const event = client.events.get(rawevent[0]);
	if (event.once) client.once(rawevent[0], (...args) => event.execute(...args));
	else client.on(rawevent[0], (...args) => event.execute(...args));
}

//Custom Events
// eslint-disable-next-line no-undef
process.on('unhandledRejection', (error) => {
	client.ch.logger('Unhandled Rejection', error);
});

/*
AP.on('posted', () => {
  console.log('Posted stats to Top.gg!')
})
*/
