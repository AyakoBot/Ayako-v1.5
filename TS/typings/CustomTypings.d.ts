import type Eris from 'eris';
import type Jobs from 'node-schedule';

export interface command {
  name: string;
  cooldown?: number;
}

export interface MessagePayload extends Eris.AdvancedMessageContent {
  files?: Eris.FileContent[];
}

export class Client extends Eris.Client {
  eventPaths: string[];
  mutes: Map<string, Jobs.Job>;
  bans: Map<string, Jobs.Job>;
  channelBans: Map<string, Jobs.Job>;
  reminders: Map<string, Jobs.Job>;
  disboardBumpReminders: Map<string, Jobs.Job>;
  giveaways: Map<string, Jobs.Job>;
  invites: Map<string, Eris.Invite>;
  verificationCodes: Map<string, string>;
  neko: typeof import('../BaseClient/NekoClient');
  constants: typeof import('../BaseClient/Other/Constants.json');
  objectEmotes: typeof import('../BaseClient/Other/ObjectEmotes.json');
  stringEmotes: typeof import('../BaseClient/Other/StringEmotes.json');
  mainID: string;
  channelQueue: Map<string, MessagePayload[]>;
  channelTimeout: Map<string, Jobs.Job>;
  channelCharLimit: Map<string, Jobs.Job>;
  ch: typeof import('../BaseClient/ClientHelper');
}
