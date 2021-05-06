const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');
//Create Discord Client
const client = new Discord.Client({ 
	shards:'auto', 
	partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
	intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
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

//Connect to Discord
client.login(auth.token).then(() => {
	console.log('| Discord Client connected at '+ new Date().toUTCString());
});


client.invites = new Map();
client.channelWebhooks = new Map();
client.ch = require('./ClientHelper.js');
client.constants = require('../Constants.json');


module.exports = { client };