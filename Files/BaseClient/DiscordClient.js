/* eslint-disable global-require,import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');
const Eris = require('./ErisClient');

// Create Discord Client
const client = new Discord.Client({
  shards: 'auto',
  partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'USER', 'GUILD_MEMBER'],
  intents: new Discord.Intents(14335),
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: false,
  },
  failIfNotExists: false,
});

// Create Command Collection and gather all Command Files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./Files/Commands').filter((file) => file.endsWith('.js'));
commandFiles.forEach((file) => {
  const command = require(`../Commands/${file}`);
  client.commands.set(command.name, command);
});

// Create Language Collection and gather all Language Files
client.languages = new Discord.Collection();
const languageFiles = fs.readdirSync('./Files/Languages').filter((file) => file.endsWith('.json'));
languageFiles.forEach((file) => {
  const language = require(`../Languages/${file}`);
  const name = file.replace(/.json/g, '');
  client.languages.set(name, language);
});

// Create Event Collection and gather all Event Files
client.events = new Discord.Collection();
const eventsDir = fs.readdirSync('./Files/Events');
const reg = new RegExp('.js', 'g');
eventsDir.forEach((folder) => {
  if (folder.endsWith('.js')) {
    const event = require(`../Events/${folder}`);
    event.path = `../Events/${folder}`;
    client.events.set(folder.replace(reg, ''), event);
  } else {
    const key = folder.replace(/Events/g, '');
    const eventFiles = fs.readdirSync(`./Files/Events/${folder}`);
    eventFiles.forEach((file) => {
      if (file.endsWith('.js') && file.startsWith(key)) {
        const event = require(`../Events/${folder}/${file}`);
        event.path = `../Events/${folder}/${file}`;
        client.events.set(file.replace(reg, ''), event);
      } else if (file.startsWith(key) && !file.endsWith('.js')) {
        fs.readdirSync(`./Files/Events/${folder}/${file}`).forEach((eventFolderFile) => {
          if (`${eventFolderFile}`.endsWith('.js') && `${eventFolderFile}`.startsWith(key)) {
            const event = require(`../Events/${folder}/${file}/${eventFolderFile}`);
            event.path = `../Events/${folder}/${file}/${eventFolderFile}`;
            client.events.set(eventFolderFile.replace(reg, ''), event);
          }
        });
      }
    });
  }
});

client.settingsEditors = new Discord.Collection();
fs.readdirSync('./Files/Commands/settings/editors')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const editorfile = require(`../Commands/settings/editors/${file}`);
    client.settingsEditors.set(file.slice(0, -3), editorfile);
  });

client.invites = new Map();
client.mutes = new Discord.Collection();
client.bans = new Discord.Collection();
client.channelWebhooks = new Map();
client.constants = require('../Constants.json');

client.setMaxListeners(63);
client.antiraidCache = new Discord.Collection();

client.eris = Eris;

module.exports = client;
