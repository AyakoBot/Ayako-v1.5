/* eslint-disable global-require,import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');
const Eris = require('./ErisClient');

const getSettings = () => {
  const settings = new Discord.Collection();
  const settingsFiles = fs
    .readdirSync('./Files/Commands/settings/categories')
    .filter((file) => file.endsWith('.js'));

  const settingsFolders = fs
    .readdirSync('./Files/Commands/settings/categories')
    .filter((file) => !file.endsWith('.js'));

  settingsFolders.forEach((folder) => {
    const files = fs
      .readdirSync(`./Files/Commands/settings/categories/${folder}`)
      .filter((file) => file.endsWith('.js'));

    files.forEach((file) => {
      settingsFiles.push([file, folder]);
    });
  });

  settingsFiles.forEach((file) => {
    let settingsFile;
    let path;

    if (Array.isArray(file)) {
      path = `./settings/categories/${file[1]}/${file[0]}`;
      settingsFile = require(path);
      [file, settingsFile.folder] = file;
    } else {
      path = `./settings/categories/${file}`;
      settingsFile = require(path);
    }

    if (!settingsFile.finished) return;
    settingsFile.name = file.replace('.js', '');
    settingsFile.path = path;

    settings.set(file.replace('.js', ''), settingsFile);
  });
};

const getSettingsEditors = () => {
  const settingsEditors = new Discord.Collection();

  fs.readdirSync('./Files/Commands/settings/editors')
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      const editorfile = require(`../Commands/settings/editors/${file}`);
      editorfile.path = `../Commands/settings/editors/${file}`;

      settingsEditors.set(file.slice(0, -3), editorfile);
    });

  return settingsEditors;
};

const getCommands = () => {
  const commands = new Discord.Collection();

  const commandFiles = fs.readdirSync('./Files/Commands').filter((file) => file.endsWith('.js'));
  commandFiles.forEach((file) => {
    const command = require(`../Commands/${file}`);
    commands.set(command.name, command);
  });

  return commands;
};

const getLanguages = () => {
  const languages = new Discord.Collection();
  const languageFiles = fs
    .readdirSync('./Files/Languages')
    .filter((file) => file.endsWith('.json'));

  languageFiles.forEach((file) => {
    const language = require(`../Languages/${file}`);
    const name = file.replace(/.json/g, '');
    languages.set(name, language);
  });

  return languages;
};

const getEvents = () => {
  const events = new Discord.Collection();
  const eventsDir = fs.readdirSync('./Files/Events');
  const reg = new RegExp('.js', 'g');
  eventsDir.forEach((folder) => {
    if (folder.endsWith('.js')) {
      const event = require(`../Events/${folder}`);
      event.path = `../Events/${folder}`;
      events.set(folder.replace(reg, ''), event);
    } else {
      const key = folder.replace(/Events/g, '');
      const eventFiles = fs.readdirSync(`./Files/Events/${folder}`);
      eventFiles.forEach((file) => {
        if (file.endsWith('.js') && file.startsWith(key)) {
          const event = require(`../Events/${folder}/${file}`);
          event.path = `../Events/${folder}/${file}`;
          events.set(file.replace(reg, ''), event);
        } else if (file.startsWith(key) && !file.endsWith('.js')) {
          fs.readdirSync(`./Files/Events/${folder}/${file}`).forEach((eventFolderFile) => {
            if (`${eventFolderFile}`.endsWith('.js') && `${eventFolderFile}`.startsWith(key)) {
              const event = require(`../Events/${folder}/${file}/${eventFolderFile}`);
              event.path = `../Events/${folder}/${file}/${eventFolderFile}`;
              events.set(eventFolderFile.replace(reg, ''), event);
            }
          });
        }
      });
    }
  });

  return events;
};

const getClient = () => {
  return new Discord.Client({
    shards: 'auto',
    partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'USER', 'GUILD_MEMBER'],
    intents: new Discord.Intents(14335),
    allowedMentions: {
      parse: ['users', 'roles'],
      repliedUser: false,
    },
    failIfNotExists: false,
  });
};

const client = getClient();

client.commands = getCommands();
client.events = getEvents();
client.languages = getLanguages();
client.settingsEditors = getSettingsEditors();
client.settings = getSettings();

client.mutes = new Discord.Collection();
client.bans = new Discord.Collection();
client.antiraidCache = new Discord.Collection();

client.invites = new Map();
client.channelWebhooks = new Map();
client.verificationCodes = new Map();

client.constants = require('../Constants.json');

client.setMaxListeners(63);
client.eris = Eris;

module.exports = client;
