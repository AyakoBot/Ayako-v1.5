/* eslint-disable global-require,import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');
const { dirname } = require('path');
const Constants = require('../Constants.json');
const Eris = require('./ErisClient');

const appDir = dirname(require.main.filename);

const getSettings = () => {
  const settings = new Discord.Collection();
  const settingsFiles = fs
    .readdirSync(`${appDir}/Files/Commands/settings/categories`)
    .filter((file) => file.endsWith('.js'));

  const settingsFolders = fs
    .readdirSync(`${appDir}/Files/Commands/settings/categories`)
    .filter((file) => !file.endsWith('.js'));

  settingsFolders.forEach((folder) => {
    const files = fs
      .readdirSync(`${appDir}/Files/Commands/settings/categories/${folder}`)
      .filter((file) => file.endsWith('.js'));

    files.forEach((file) => {
      settingsFiles.push([file, folder]);
    });
  });

  settingsFiles.forEach((file) => {
    let settingsFile;
    let path;

    if (Array.isArray(file)) {
      path = `${appDir}/Files/Commands/settings/categories/${file[1]}/${file[0]}`;
      settingsFile = require(path);
      [file, settingsFile.folder] = file;
    } else {
      path = `${appDir}/Files/Commands/settings/categories/${file}`;
      settingsFile = require(path);
    }

    if (!settingsFile.finished) return;
    settingsFile.name = file.replace('.js', '');
    settingsFile.path = path;

    settings.set(settingsFile.name, settingsFile);
  });

  return settings;
};

const getSettingsEditors = () => {
  const settingsEditors = new Discord.Collection();

  fs.readdirSync(`${appDir}/Files/Commands/settings/editors`)
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
  const commandFiles = fs
    .readdirSync(`${appDir}/Files/Commands`)
    .filter((file) => file.endsWith('.js'));

  commandFiles.forEach((file) => {
    const command = require(`../Commands/${file}`);

    commands.set(command.name, command);
  });

  return commands;
};

const getLanguages = () => {
  const languages = new Discord.Collection();
  const languageFiles = fs
    .readdirSync(`${appDir}/Files/Languages`)
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
  const eventsDir = fs.readdirSync(`${appDir}/Files/Events`);
  const reg = /.js/g;

  eventsDir.forEach((folder) => {
    if (folder.endsWith('.js')) {
      const event = require(`../Events/${folder}`);
      event.path = `../Events/${folder}`;

      events.set(folder.replace(reg, ''), event);
    } else {
      const key = folder.replace(/Events/g, '');
      const eventFiles = fs.readdirSync(`${appDir}/Files/Events/${folder}`);

      eventFiles.forEach((file) => {
        if (file.endsWith('.js') && file.startsWith(key)) {
          const event = require(`../Events/${folder}/${file}`);
          event.path = `../Events/${folder}/${file}`;

          events.set(file.replace(reg, ''), event);
        } else if (file.startsWith(key) && !file.endsWith('.js')) {
          fs.readdirSync(`${appDir}/Files/Events/${folder}/${file}`).forEach((eventFolderFile) => {
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
  const client = new Discord.Client({
    failIfNotExists: false,
    shards: 'auto',
    partials: [
      Discord.Partials.Message,
      Discord.Partials.Reaction,
      Discord.Partials.Channel,
      Discord.Partials.User,
      Discord.Partials.GuildMember,
      Discord.Partials.GuildScheduledEvent,
    ],
    intents: new Discord.IntentsBitField(79615),

    allowedMentions: {
      parse: ['users', 'roles'],
      repliedUser: false,
    },
    sweepers: {
      messages: {
        interval: 60,
        lifetime: 1209600,
      },
    },
  });

  client.commands = getCommands();
  client.events = getEvents();
  client.languages = getLanguages();
  client.settingsEditors = getSettingsEditors();
  client.settings = getSettings();

  client.mutes = new Discord.Collection();
  client.bans = new Discord.Collection();

  client.invites = new Map();
  client.verificationCodes = new Map();

  client.eris = Eris;
  client.constants = Constants;

  client.setMaxListeners(client.events.size);

  return client;
};

module.exports = getClient();
