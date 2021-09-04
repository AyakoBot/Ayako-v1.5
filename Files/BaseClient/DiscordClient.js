const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

//Create Discord Client
const client = new Discord.Client({ 
	shards:'auto', 
	partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'USER', 'GUILD_MEMBER'],
	intents: new Discord.Intents(32767),
	allowedMentions: {
		parse: ['users', 'roles'],
		repliedUser: false
	}
});

//Create Command Collection and gather all Command Files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./Files/Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`../Commands/${file}`);
	client.commands.set(command.name, command);
}

//Create Language Collection and gather all Language Files
client.languages = new Discord.Collection();
const languageFiles = fs.readdirSync('./Files/Languages').filter(file => file.endsWith('.json'));
for (const file of languageFiles) {
	const language = require(`../Languages/${file}`);
	const name = file.replace(/.json/g, '');
	client.languages.set(name, language);
}
//Create Event Collection and gather all Event Files
client.events = new Discord.Collection();
const eventsDir = fs.readdirSync('./Files/Events');
const reg = new RegExp('.js', 'g');
for (const folder of eventsDir) {
	if (folder.endsWith('.js')) {
		const event = require(`../Events/${folder}`);
		event.path = `../Events/${folder}`;
		client.events.set(folder.replace(reg, ''), event);
	} else {
		const key = folder.replace(/Events/g, '');
		const eventFiles = fs.readdirSync(`./Files/Events/${folder}`);
		for (const file of eventFiles) {
			if (file.endsWith('.js') && file.startsWith(key)) {
				const event = require(`../Events/${folder}/${file}`);
				event.path = `../Events/${folder}/${file}`;
				client.events.set(file.replace(reg, ''), event);
			} else {
				if (file.startsWith(key) && !file.endsWith('.js')) {
					for (const eventFolderFile of fs.readdirSync(`./Files/Events/${folder}/${file}`)) {
						if (`${eventFolderFile}`.endsWith('.js') && `${eventFolderFile}`.startsWith(key)) {
							const event = require(`../Events/${folder}/${file}/${eventFolderFile}`);
							event.path = `../Events/${folder}/${file}/${eventFolderFile}`;
							client.events.set(eventFolderFile.replace(reg, ''), event);
						} 
					}
				}
			}
		}
	}
}

//Connect to Discord
client.login(auth.token).then(() => {
	console.log('| Discord Client connected at '+ new Date().toUTCString());
});

client.invites = new Map();
client.channelWebhooks = new Map();
client.constants = require('../Constants.json');
client.setMaxListeners(61);
client.roleQueue = new Discord.Collection();

module.exports = { client };