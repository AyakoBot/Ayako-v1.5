import Eris from 'eris';
import * as fs from 'fs';
import type * as Jobs from 'node-schedule';
import auth from './auth.json';
import type CT from '../typings/CustomTypings';
import { default as ch } from './ClientHelper';

const getEvents = () => {
  const paths: string[] = [];

  const eventsDir = fs.readdirSync(`${process.cwd()}/Files/Events`);

  eventsDir.forEach((folder) => {
    if (folder.endsWith('.js')) {
      const path = `${process.cwd()}/Files/Events/${folder}`;
      paths.push(path);

      return;
    }

    const key = folder.replace(/events/gi, '');
    const eventFiles = fs.readdirSync(`${process.cwd()}/Files/Events/${folder}`);

    eventFiles.forEach((file) => {
      if (file.endsWith('.js') && file.startsWith(key)) {
        const path = `${process.cwd()}/Files/Events/${folder}/${file}`;
        paths.push(path);

        return;
      }

      if (file.startsWith(key) && !file.endsWith('.js')) {
        fs.readdirSync(`${process.cwd()}/Files/Events/${folder}/${file}`).forEach(
          (eventFolderFile) => {
            if (
              String(eventFolderFile).endsWith('.js') &&
              String(eventFolderFile).startsWith(key)
            ) {
              const path = `${process.cwd()}/Files/Events/${folder}/${file}/${eventFolderFile}`;

              paths.push(path);
            }
          },
        );
      }
    });
  });

  return paths;
};

class Client extends Eris.Client {
  eventPaths: string[];
  mutes: Map<string, Jobs.Job>;
  bans: Map<string, Jobs.Job>;
  channelBans: Map<string, Jobs.Job>;
  reminders: Map<string, Jobs.Job>;
  disboardBumpReminders: Map<string, Jobs.Job>;
  giveaways: Map<string, Jobs.Job>;
  invites: Map<string, Eris.Invite>;
  verificationCodes: Map<string, string>;
  neko: typeof import('./NekoClient');
  constants: typeof import('./Other/Constants.json');
  objectEmotes: typeof import('./Other/ObjectEmotes.json');
  stringEmotes: typeof import('./Other/StringEmotes.json');
  mainID: string;
  channelQueue: Map<string, Jobs.Job>;
  channelTimeout: Map<string, Jobs.Job>;
  channelCharLimit: Map<string, CT.MessagePayload[]>;
  ch: typeof ch;

  constructor(token: string) {
    super(token, {
      allowedMentions: { everyone: false, roles: false, users: false, repliedUser: false },
      defaultImageFormat: 'png',
      defaultImageSize: 2048,
      intents: 112383,
      maxShards: 'auto',
      messageLimit: 500,
      restMode: true,
      disableEvents: {
        TYPING_START: true,
        PRESENCE_UPDATE: true,
      },
    });

    this.eventPaths = getEvents();

    this.mutes = new Map();
    this.bans = new Map();
    this.channelBans = new Map();
    this.reminders = new Map();
    this.disboardBumpReminders = new Map();
    this.giveaways = new Map();

    this.invites = new Map();
    this.verificationCodes = new Map();

    this.neko = require('./NekoClient');
    this.constants = require('./Other/Constants.json');
    this.objectEmotes = require('./Other/ObjectEmotes.json');
    this.stringEmotes = require('./Other/StringEmotes.json');

    this.mainID = '650691698409734151';

    this.channelQueue = new Map();
    this.channelTimeout = new Map();
    this.channelCharLimit = new Map();

    this.ch = ch;

    this.setMaxListeners(this.eventPaths.length);
  }
}

export default new Client(auth.token);
