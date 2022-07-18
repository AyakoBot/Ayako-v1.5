import type Eris from 'eris';
import type Jobs from 'node-schedule';
import type DBT from './DataBaseTypings';

export interface Command {
  name: string;
  cooldownRows?: DBT.cooldowns;
  deleteCommandRows?: DBT.deletecommands;
  aliases: string[];
  takesFirstArg: false;
  dm: boolean;
  thisGuildOnly?: string[];
  perm?: bigint | number;
  dmOnly?: boolean;
  type: 'mod' | 'other' | 'owner';
  deleteCommandRow?: DBT.deletecommands;
  cooldown?: number;
  execute: <T extends keyof typeof import('../Languages/lan-en.json')['commands']>(
    msg: Eris.Message,
    {
      language,
      lan,
    }: {
      language: typeof import('../Languages/lan-en.json');
      lan: typeof import('../Languages/lan-en.json').commands[T];
    },
    command: Command,
    object?: { [key: string]: unknown },
  ) => void;
}

type PartialSlashCommand = Omit<
  Command,
  'cooldownRows' | 'deleteCommandRows' | 'deleteCommandRow' | 'execute'
>;

export interface SlashCommand extends PartialSlashCommand {
  execute: <T extends keyof typeof import('../Languages/lan-en.json')['slashCommands']>(
    cmd: Interaction,
    {
      language,
      lan,
    }: {
      language: typeof import('../Languages/lan-en.json');
      lan: typeof import('../Languages/lan-en.json').slashCommands[T];
    },
    command: SlashCommand,
    object?: { [key: string]: unknown },
  ) => void;
}

export type AutocompleteCommand = <
  T extends keyof typeof import('../Languages/lan-en.json')['slashCommands'],
>(
  cmd: Interaction,
  {
    language,
    lan,
  }: {
    language: typeof import('../Languages/lan-en.json');
    lan: typeof import('../Languages/lan-en.json').slashCommands[T];
  },
) => void;

export type ComponentCommand = <
  T extends keyof typeof import('../Languages/lan-en.json')['slashCommands'],
>(
  cmd: Interaction,
  language: typeof import('../Languages/lan-en.json'),
) => void;

export interface MessagePayload extends Eris.AdvancedMessageContent {
  embeds?: Eris.EmbedOptions[];
  files?: Eris.FileContent[];
  ephemeral?: boolean;
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

export interface MessageCollectorOptions {
  time?: number;
  count?: 10;
  filter?: (_msg: Eris.Message) => true;
}

export interface OldMessage extends Eris.OldMessage {
  id: string;
}

export interface Message extends Eris.Message {
  guild?: Eris.Guild;
  language: typeof import('../Languages/lan-en.json');
  edits?: Eris.OldMessage[];
}

export interface CommandInteraction extends Eris.CommandInteraction {
  user: Eris.User;
  guild?: Eris.Guild;
  language: typeof import('../Languages/lan-en.json');
}

export interface AutocompleteInteraction extends Eris.AutocompleteInteraction {
  user: Eris.User;
  guild?: Eris.Guild;
  language: typeof import('../Languages/lan-en.json');
}

export interface ComponentInteraction extends Eris.ComponentInteraction {
  user: Eris.User;
  guild?: Eris.Guild;
  language: typeof import('../Languages/lan-en.json');
}

export interface ModBaseEventOptions {
  executor: Eris.User;
  target: Eris.User;
  reason: string;
  msg?: Message;
  guild: Eris.Guild;
  type:
    | 'banAdd'
    | 'softbanAdd'
    | 'tempbanAdd'
    | 'tempchannelbanAdd'
    | 'channelbanAdd'
    | 'channelbanRemove'
    | 'banRemove'
    | 'kickAdd'
    | 'roleAdd'
    | 'roleRemove'
    | 'muteRemove'
    | 'tempmuteAdd'
    | 'warnAdd';
  duration?: number;
  m?: Eris.Message;
  doDBonly?: boolean;
  source?: string;
  forceFinish?: boolean;
  channel?: Eris.AnyGuildChannel;
  role?: Eris.Role;
}

interface basicTopGGVote {
  user: string;
  type: 'upvote' | 'test';
  authorization: string;
  guild: Eris.Guild;
}
export interface TopGGBotVote extends basicTopGGVote {
  bot: string;
  isWeekend: boolean;
}

export interface TopGGGuildVote extends basicTopGGVote {
  guildID: string;
}

export interface OldUser {
  username: string;
  discriminator: string;
  avatar?: string;
}
