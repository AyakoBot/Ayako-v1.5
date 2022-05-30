/* eslint-disable global-require,import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');
const Constants = require('./Other Client Files/Constants.json');
const Eris = require('./ErisClient');

const getEvents = () => {
  const paths = [];

  const eventsDir = fs.readdirSync(`${require.main.path}/Files/Events`);

  eventsDir.forEach((folder) => {
    if (folder.endsWith('.js')) {
      const path = `${require.main.path}/Files/Events/${folder}`;
      paths.push(path);

      return;
    }

    const key = folder.replace(/events/gi, '');
    const eventFiles = fs.readdirSync(`${require.main.path}/Files/Events/${folder}`);

    eventFiles.forEach((file) => {
      if (file.endsWith('.js') && file.startsWith(key)) {
        const path = `${require.main.path}/Files/Events/${folder}/${file}`;
        paths.push(path);

        return;
      }

      if (file.startsWith(key) && !file.endsWith('.js')) {
        fs.readdirSync(`${require.main.path}/Files/Events/${folder}/${file}`).forEach(
          (eventFolderFile) => {
            if (
              String(eventFolderFile).endsWith('.js') &&
              String(eventFolderFile).startsWith(key)
            ) {
              const path = `${require.main.path}/Files/Events/${folder}/${file}/${eventFolderFile}`;

              paths.push(path);
            }
          },
        );
      }
    });
  });

  return paths;
};

class Client extends Discord.Client {
  constructor() {
    super({
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
      intents: new Discord.IntentsBitField(112383),
      // no presences 112383
      // presences 112639

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

    this.eventPaths = getEvents();

    this.mutes = new Discord.Collection();
    this.bans = new Discord.Collection();
    this.channelBans = new Discord.Collection();
    this.reminders = new Discord.Collection();
    this.disboardBumpReminders = new Discord.Collection();
    this.giveaways = new Discord.Collection();

    this.invites = new Discord.Collection();
    this.verificationCodes = new Discord.Collection();

    this.eris = Eris;
    this.neko = require('./NekoClient');
    this.constants = Constants;
    this.objectEmotes = require('./Other Client Files/ObjectEmojis.json');
    this.textEmotes = require('./Other Client Files/TextEmojis.json');

    this.mainID = '650691698409734151';

    this.channelQueue = new Map();
    this.channelTimeout = new Map();
    this.channelCharLimit = new Map();

    this.setMaxListeners(this.eventPaths.length);
  }
}

const getClient = () => {
  const client = new Client();

  return client;
};

module.exports = getClient();
