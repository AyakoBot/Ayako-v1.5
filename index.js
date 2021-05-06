const { client } = require('./Files/BaseClient/DiscordClient.js');
const ch = require('./Files/BaseClient/ClientHelper.js');
ch.pathCheck();
//const { AP } = require('./Files/BaseClient/DBL');


// eslint-disable-next-line no-undef
process.setMaxListeners(Infinity);
//Discord Info events
//client.on('debug', (log) => {console.log(log);});

client.on('error', (error) => {
	ch.logger('Discord Client\'s WebSocket encountered a connection error', error);
});
client.on('invalidated', () => {
	console.error('Discord Client was invalidated!');
});
client.on('rateLimit', (rateLimitInfo) => {
	ch.logger('Discord Client was RateLimited', `Timeout: ${rateLimitInfo.timeout}\nLimit: ${rateLimitInfo.limit}\nMethod: ${rateLimitInfo.method}\nPath: ${rateLimitInfo.path}\nRoute: ${rateLimitInfo.route}`);
});
client.on('ready', () => {
	const file = require('./Files/Events/readyEvents/ready.js'); 
	file.execute();
});
client.on('shardDisconnect', (event, id) => {
	ch.logger(`Discord Client Shard with ID ${id} was Disconnected!`, event);
});
client.on('shardError', (error, shardID) => {
	ch.logger(`Discord Client Shard with ID ${shardID} has enountered an Error!`, error);
});
client.on('shardReady', (id, unavailableGuilds) => {
	if (unavailableGuilds) {
		ch.logger(`Discord Client Shard with ID ${id} is Ready. Unavailable Guilds:`, unavailableGuilds);
	} else {
		ch.logger(`Discord Client Shard with ID ${id} is Ready.`);
	}
});
client.on('shardReconnecting', (id) => {
	ch.logger(`Discord Client Shard with ID ${id} is Reconnecting.`);
});
client.on('shardResume', (id, replayedEvents) => {
	ch.logger(`Discord Client Shard with ID ${id} is now Resuming.`, replayedEvents+' replayed Events');
});
client.on('raw', (event) => {
	const file = require('./Files/Events/rawEvents/raw.js'); 
	file.execute(event);
});
client.on('warn', (err, id) => {
	ch.logger(`Discord Client Shard with ID ${id} recieved a warning`, err);
});
//guild Events
client.on('channelCreate', (channel) => {
	const file = require('./Files/Events/channelEvents/channelCreate.js'); 
	file.execute(channel);
});
client.on('channelDelete', (channel) => {
	const file = require('./Files/Events/channelEvents/channelDelete.js'); 
	file.execute(channel);
});
client.on('channelPinsUpdate', (channel, time) => {
	const file = require('./Files/Events/channelEvents/channelPinsUpdate.js'); 
	file.execute(channel, time);
});
client.on('channelUpdate', (channel, oldChannel) => {
	const file = require('./Files/Events/channelEvents/channelUpdate.js'); 
	file.execute(channel, oldChannel);
});

//emoji Events
client.on('emojiCreate', (emoji) => {
	const file = require('./Files/Events/emojiEvents/emojiCreate.js'); 
	file.execute(emoji);
});
client.on('emojiDelete', (emoji) => {
	const file = require('./Files/Events/emojiEvents/emojiDelete.js'); 
	file.execute(emoji);
});
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
	const file = require('./Files/Events/emojiEvents/emojiUpdate.js'); 
	file.execute(oldEmoji, newEmoji);
});

//guild Events
client.on('guildBanAdd', (guild, user) => {
	const file = require('./Files/Events/guildEvents/guildBanAdd.js'); 
	file.execute(guild, user);
});
client.on('guildBanRemove', (guild, user) => {
	const file = require('./Files/Events/guildEvents/guildBanRemove.js'); 
	file.execute(guild, user);
});
client.on('guildCreate', (guild) => {
	const file = require('./Files/Events/guildEvents/guildCreate.js'); 
	file.execute(guild);
});
client.on('guildDelete', (guild) => {
	const file = require('./Files/Events/guildEvents/guildDelete.js'); 
	file.execute(guild);
});
client.on('guildIntegrationsUpdate', (guild) => {
	const file = require('./Files/Events/guildEvents/guildIntegrationsUpdate.js'); 
	file.execute(guild);
});
client.on('guildMemberAdd', (member) => {
	const file = require('./Files/Events/guildEvents/guildMemberAdd/guildMemberAdd.js'); 
	file.execute(member);
});
client.on('guildMemberAvailable', (member) => {
	const file = require('./Files/Events/guildEvents/guildMemberAvailable.js'); 
	file.execute(member);
});
client.on('guildMemberRemove', (member) => {
	const file = require('./Files/Events/guildEvents/guildMemberRemove.js'); 
	file.execute(member);
});
client.on('guildMembersChunk', (members, guild, chunk) => {
	const file = require('./Files/Events/guildEvents/guildMembersChunk.js'); 
	file.execute(members, guild, chunk);
});
client.on('guildMemberSpeaking', (member, speaking) => {
	const file = require('./Files/Events/guildEvents/guildMemberSpeaking.js'); 
	file.execute(member, speaking);
});
client.on('guildMemberUpdate', (oldMember, newMember) => {
	const file = require('./Files/Events/guildEvents/guildMemberUpdate.js'); 
	file.execute(oldMember, newMember);
});
client.on('guildUnavailable', (guild) => {
	const file = require('./Files/Events/guildEvents/guildUnavailable.js'); 
	file.execute(guild);
});
client.on('guildUpdate', (oldGuild, newGuild) => {
	const file = require('./Files/Events/guildEvents/guildUpdate.js'); 
	file.execute(oldGuild, newGuild);
});

//invite Events
client.on('inviteCreate', (invite) => {
	const file = require('./Files/Events/inviteEvents/inviteCreate.js'); 
	file.execute(invite);
});
client.on('inviteDelete', (invite) => {
	const file = require('./Files/Events/inviteEvents/inviteDelete.js'); 
	file.execute(invite);
});

//message Events
client.on('message', (msg) => {
	const file = require('./Files/Events/messageEvents/message'); 
	file.execute(msg);
});
client.on('messageDelete', (msg) => {
	const file = require('./Files/Events/messageEvents/messageDelete/messageDelete.js'); 
	file.execute(msg);
});
client.on('messageDeleteBulk', (msgs) => {
	const file = require('./Files/Events/messageEvents/messageDeleteBulk.js'); 
	file.execute(msgs);
});
client.on('messageReactionAdd', (reaction, user) => {
	const file = require('./Files/Events/messageEvents/messageReactionAdd/messageReactionAdd.js'); 
	file.execute(reaction, user);
});
client.on('messageReactionRemove', (reaction, user) => {
	const file = require('./Files/Events/messageEvents/messageReactionRemove.js'); 
	file.execute(reaction, user);
});
client.on('messageReactionRemoveAll', (msg) => {
	const file = require('./Files/Events/messageEvents/messageReactionRemoveAll.js'); 
	file.execute(msg);
});
client.on('messageReactionRemoveEmoji', (reaction) => {
	const file = require('./Files/Events/messageEvents/messageReactionRemoveEmoji.js'); 
	file.execute(reaction);
});
client.on('messageUpdate', (oldMsg, newMsg) => {
	const file = require('./Files/Events/messageEvents/messageUpdate/messageUpdate.js'); 
	file.execute(oldMsg, newMsg);
});

//role Events
client.on('roleCreate', (role) => {
	const file = require('./Files/Events/roleEvents/roleCreate.js'); 
	file.execute(role);
});
client.on('roleDelete', (role) => {
	const file = require('./Files/Events/roleEvents/roleDelete.js'); 
	file.execute(role);
});
client.on('roleUpdate', (oldRole, newRole) => {
	const file = require('./Files/Events/roleEvents/roleUpdate.js'); 
	file.execute(oldRole, newRole);
});

//voice Events
client.on('voiceStateUpdate', (oldState, newState) => {
	const file = require('./Files/Events/voiceEvents/voiceStateUpdate.js'); 
	file.execute(oldState, newState);
});

//other Discord Events
client.on('presenceUpdate', (oldPresence, newPresence) => {
	const file = require('./Files/Events/presenceEvents/presenceUpdate.js'); 
	file.execute(oldPresence, newPresence);
});
client.on('webhookUpdate', (data) => {
	const file = require('./Files/Events/webhookEvents/webhookUpdate.js'); 
	file.execute(data);
});
client.on('typingStart', (channel, user) => {
	const file = require('./Files/Events/typingEvents/typingStart.js'); 
	file.execute(channel, user);
});
client.on('userUpdate', (oldUser, newUser) => {
	const file = require('./Files/Events/userEvents/userUpdate.js'); 
	file.execute(oldUser, newUser);
});

//Custom Events
// eslint-disable-next-line no-undef
process.on('unhandledRejection', error => {
	ch.logger('Unhandled Rejection', error);
});

client.on('muteAdd', (executor, target, guild, reason) => {
	const file = require('./Files/Events/modEvents/muteAdd.js'); 
	file.execute(executor, target, guild, reason);
});
client.on('muteRemove', (executor, target, guild, reason) => {
	const file = require('./Files/Events/modEvents/muteRemove.js'); 
	file.execute(executor, target, guild, reason);
});
/*
AP.on('posted', () => {
  console.log('Posted stats to Top.gg!')
})
*/


/*
antiSpam.on('error', (message, error, type) => {

console.log(`${message.author.tag} couldn't receive the sanction '${type}', error: ${error}`);
});
antiSpam.on('banAdd', (msg) => {

const eventfile = client.eventfiles.get('AntiSpamBanAdd');
eventfile.execute(msg, client);
});
antiSpam.on('kickAdd', (msg) => {

const eventfile = client.eventfiles.get('AntiSpamKickAdd');
eventfile.execute(msg, client);
});
antiSpam.on('muteAdd', (msg) => {

const eventfile = client.eventfiles.get('AntiSpamMuteAdd');
eventfile.execute(msg, client, pool);
});
antiSpam.on('ofwarnAdd', (msg) => {

const eventfile = client.eventfiles.get('AntiSpamOfWarnAdd');
eventfile.execute(msg, client, pool);
});
client.on('message', (msg) => {

const eventfile = client.eventfiles.get('MessageEvent');
eventfile.execute(msg, client, pool);
if (client.uptime > 10000) {
if (!msg._edits || msg._edits == 0) {
antiSpam.message(msg);
}
}
}); 

*/