import type Eris from 'eris';
import type Jobs from 'node-schedule';
import type DBT from './DataBaseTypings';
export interface Command {
  name: string;
  cooldownRow?: DBT.cooldowns;
  deleteCommandRow?: DBT.deletecommands;
}

type AdvancedMessageContent_Modified = Omit<Eris.AdvancedMessageContent, 'embeds'>;
export interface MessagePayload extends AdvancedMessageContent_Modified {
  embeds?: Eris.EmbedOptions[] | undefined;
  files?: Eris.FileContent[] | undefined;
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

export type Language = typeof import('../Languages/lan-en.json');

export interface MessageCollectorOptions {
  timeout: number;
  count: number;
  filter: (_msg: Eris.Message) => true;
}

export interface OldMessage extends Eris.OldMessage {
  id: string;
}
