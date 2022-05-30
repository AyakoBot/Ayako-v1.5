import { Snowflake } from 'discord.js';
import type { QueryResultBase } from 'pg';

// Tables
export interface afk extends QueryResultBase {
  userid: Snowflake;
  guildid: Snowflake;
  text: string;
  since: string;
}

export interface antiraidsettings extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  punishment: boolean;
  posttof?: boolean;
  postchannel?: Snowflake;
  pingroles?: Snowflake[];
  pingusers?: Snowflake[];
  time: string;
  jointhreshold: string;
  punishmenttof?: boolean;
}

export interface antispamsettings extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  giveofficialwarnstof: boolean;
  muteafterwarnsamount: string;
  kickafterwarnsamount: string;
  banafterwarnsamount: string;
  muteenabledtof: boolean;
  kickenabledtof: boolean;
  baneneabledtof: boolean;
  readofwarnstof: boolean;
  bpuserid?: Snowflake[];
  bproleid?: Snowflake[];
  bpchannelid?: Snowflake[];
  forcedisabled?: boolean;
}

export interface antivirus extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  bantof: boolean;
  warntof: boolean;
  kicktof: boolean;
  verbaltof: boolean;
  muteafterwarnsamount?: string;
  warnafterwarnsamount?: string;
  banafterwarnsamount?: string;
  kickafterwarnsamount?: string;
  minimize?: string;
  delete?: string;
  linklogging: boolean;
  linklogchannels?: Snowflake[];
}

export interface antiviruslog extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  type: string;
  date: string;
}

export interface autopunish extends QueryResultBase {
  guildid: Snowflake;
  uniquetimestamp: string;
  duration?: string;
  warnamount: string;
  punishment?: string;
  active: boolean;
  addroles?: Snowflake[];
  removeroles?: Snowflake[];
  sendtof: boolean;
  sendchannels?: Snowflake[];
  confirmationreq: boolean;
}

export interface autorole extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  botroleid?: Snowflake[];
  userroleid?: Snowflake[];
  allroleid?: Snowflake[];
}

export interface blacklists extends QueryResultBase {
  active: boolean;
  warntof: boolean;
  kicktof: boolean;
  bantof: boolean;
  warnafter?: string;
  muteafter?: string;
  kickafter?: string;
  banafter?: string;
  bpchannelid?: Snowflake[];
  bproleid?: Snowflake[];
  bpuserid?: Snowflake[];
  words?: string[];
  guildid: Snowflake;
  mutetof: boolean;
}

export interface cooldowns extends QueryResultBase {
  command: string;
  cooldown: string;
  active: boolean;
  bpchannelid?: Snowflake[];
  bproleid?: Snowflake[];
  bpuserid?: Snowflake[];
  activechannelid?: Snowflake[];
  uniquetimestamp: string;
  guildid: Snowflake;
}

export interface customembeds extends QueryResultBase {
  color?: string;
  title?: string;
  url?: string;
  authorname?: string;
  authoriconurl?: string;
  authorurl?: string;
  description?: string;
  thumbnail?: string;
  fieldnames?: string[];
  fieldvalues?: string[];
  fieldinlines?: boolean[];
  image?: string;
  timestamp?: string;
  footertext?: string;
  footericonurl?: string;
  uniquetimestamp: string;
  guildid: Snowflake;
  name?: string;
}

export interface deletecommands extends QueryResultBase {
  uniquetimestamp: string;
  guildid: Snowflake;
  deletecommand: boolean;
  deletereply: boolean;
  deletetimeout?: string;
  active: boolean;
  commands: string[];
}

export interface disabledcommands extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  commands?: string[];
  channels?: Snowflake[];
  bproleid?: Snowflake[];
  blroleid?: Snowflake[];
  bpuserid?: Snowflake[];
  bluserid?: Snowflake[];
  bpchannelid?: Snowflake[];
  blchannelid?: Snowflake[];
  uniquetimestamp: string;
}

export interface disboard extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  nextbump?: string;
  channelid?: Snowflake;
  repeatreminder?: string;
  roles?: Snowflake[];
  users?: Snowflake[];
  rempchannelid?: Snowflake;
  deletereply: boolean;
  msgid?: Snowflake;
}

export interface giveaways extends QueryResultBase {
  guildid: Snowflake;
  msgid: Snowflake;
  description: string;
  winnercount: string;
  endtime: string;
  reqrole?: Snowflake;
  actualprize?: string;
  host: Snowflake;
  ended: boolean;
  channelid: Snowflake;
  participants?: Snowflake[];
}

export interface guildsettings extends QueryResultBase {
  guildid: Snowflake;
  prefix?: string;
  interactionsmode: boolean;
  lan: string;
  errorchannel?: Snowflake;
  vanity?: string;
}

export interface level extends QueryResultBase {
  userid: Snowflake;
  guildid: Snowflake;
  type: string;
  xp: string;
  level?: string;
}

export interface leveling extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  xpmultiplier: string;
  blchannels?: Snowflake[];
  blroles?: Snowflake[];
  blusers?: Snowflake[];
  wlchannels?: Snowflake[];
  wlroles?: Snowflake[];
  wlusers?: Snowflake[];
  xppermsg: string;
  rolemode: boolean;
  lvlupmode?: string;
  lvlupdeltimeout?: string;
  lvlupchannels?: Snowflake[];
  lvlupemotes?: (Snowflake | string)[];
  embed?: string;
  ignoreprefixes: boolean;
  prefixes?: string[];
}

export interface levelingmultiplierchannels extends QueryResultBase {
  guildid: Snowflake;
  channels?: Snowflake[];
  multiplier: string;
  uniquetimestamp: string;
}

export interface levelingmultiroles extends QueryResultBase {
  guildid: Snowflake;
  roles?: Snowflake[];
  multiplier: string;
  uniquetimestamp: string;
}

export interface levelingroles {
  guildid: Snowflake;
  level?: string;
  roles?: Snowflake[];
  uniquetimestamp: string;
}

export interface levelingruleschannels extends QueryResultBase {
  guildid: Snowflake;
  channels?: Snowflake[];
  rules?: string;
  uniquetimestamp: string;
  hasleastattachments?: string;
  hasmostattachments?: string;
  hasleastcharacters?: string;
  hasmostcharacters?: string;
  hasleastwords?: string;
  hasmostwords?: string;
  mentionsleastusers?: string;
  mentionsmostusers?: string;
  mentionsleastchannels?: string;
  mentionsmostchannels?: string;
  mentionsleastroles?: string;
  mentionsmostroles?: string;
  hasleastlinks?: string;
  hasmostlinks?: string;
  hasleastemotes?: string;
  hasmostemotes?: string;
  hasleastmentions?: string;
  hasmostmentions?: string;
}

export interface logchannels extends QueryResultBase {
  guildid: Snowflake;
  emojievents?: Snowflake[];
  guildevents?: Snowflake[];
  inviteevents?: Snowflake[];
  messageevents?: Snowflake[];
  modlogs?: Snowflake[];
  roleevents?: Snowflake[];
  userevents?: Snowflake[];
  voiceevents?: Snowflake[];
  webhookevents?: Snowflake[];
  settingslog?: Snowflake[];
  channelevents?: Snowflake[];
  stageinstanceevents?: Snowflake[];
  stickerevents?: Snowflake[];
  threadevents?: Snowflake[];
  guildmemberevents?: Snowflake[];
}

export interface modroles extends QueryResultBase {
  guildid: Snowflake;
  roleid: Snowflake;
  perms?: bigint;
  whitelistedcommands?: string[];
  whitelistedusers?: Snowflake[];
  whitelistedroles?: Snowflake[];
  blacklistedroles?: Snowflake[];
  blacklistedusers?: Snowflake[];
  active: boolean;
  blacklistedcommands?: string[];
  uniquetimestamp: string;
  mutedurationdefault?: string;
}

export interface modsettings extends QueryResultBase {
  guildid: Snowflake;
  bans: boolean;
  channelbans: boolean;
  kicks: boolean;
  mutes: boolean;
  warns: boolean;
  banstime?: string;
  channelbanstime?: string;
  kickstime?: string;
  mutestime?: string;
  warnstime?: string;
}

export interface nitroroles extends QueryResultBase {
  guildid: Snowflake;
  uniquetimestamp: string;
  roles?: Snowflake[];
  days?: string;
}

export interface nitrosettings extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  logchannels?: Snowflake[];
  rolemode: boolean;
}

export interface nitrousers extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  booststart: string;
  boostend?: string;
}

export interface policy_guilds extends QueryResultBase {
  guildid: Snowflake;
}

export interface policy_users extends QueryResultBase {
  userid: Snowflake;
}

export interface punish_bans extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration?: string;
}

export interface punish_channelbans extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration?: string;
}

export interface punish_kicks extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
}

export interface punish_mutes extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration?: string;
}

export interface punish_tempbans extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration: string;
}

export interface punish_tempchannelbans extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration: string;
}

export interface punish_tempmutes extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
  duration: string;
}

export interface punish_warns extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  reason?: string;
  uniquetimestamp: string;
  channelid: Snowflake;
  channelname: string;
  executorid: Snowflake;
  executorname: string;
  msgid: Snowflake;
}

export interface reminders extends QueryResultBase {
  userid: Snowflake;
  channelid: Snowflake;
  reason: string;
  uniquetimestamp: string;
  endtime: string;
  msgid: Snowflake;
}

export interface roleseparator extends QueryResultBase {
  guildid: Snowflake;
  separator: Snowflake;
  active: boolean;
  stoprole?: Snowflake;
  isvarying: boolean;
  roles?: Snowflake[];
  uniquetimestamp: string;
}

export interface roleseparatorsettings extends QueryResultBase {
  guildid: Snowflake;
  stillrunning: boolean;
  channelid?: Snowflake;
  messageid?: Snowflake;
  duration?: string;
  startat?: string;
  index?: string;
  length?: string;
}

export interface rrbuttons extends QueryResultBase {
  uniquetimestamp: string;
  roles?: Snowflake[];
  emoteid?: Snowflake;
  buttontext?: string;
  active: boolean;
  messagelink: string;
  guildid: Snowflake;
}

export interface rrreactions extends QueryResultBase {
  uniquetimestamp: string;
  emoteid: Snowflake;
  roles?: Snowflake[];
  active: boolean;
  messagelink: string;
  guildid: Snowflake;
}

export interface rrsettings extends QueryResultBase {
  guildid: Snowflake;
  messagelink: string;
  uniquetimestamp: string;
  name: string;
  onlyone?: boolean;
  active: boolean;
  anyroles?: Snowflake[];
}

export interface selfroles extends QueryResultBase {
  guildid: Snowflake;
  roles?: Snowflake[];
  onlyone?: boolean;
  uniquetimestamp: string;
  blacklistedroles?: Snowflake[];
  blacklistedusers?: Snowflake[];
  whitelistedroles?: Snowflake[];
  whitelistedusers?: Snowflake[];
  active: boolean;
}

export interface stats extends QueryResultBase {
  usercount: string;
  guildcount: string;
  channelcount: string;
  rolecount: string;
  allusers: string;
  willis?: Snowflake[];
  count?: string;
  antispam: boolean;
  verbosity: boolean;
  heartbeat: string;
}

export interface statschannel extends QueryResultBase {
  guildid: Snowflake;
  channelid: Snowflake;
  type?: string;
}

export interface sticky extends QueryResultBase {
  guildid: Snowflake;
  roles?: Snowflake[];
  stickyrolesmode: boolean;
  stickyrolesactive: boolean;
  stickypermsactive: boolean;
}

export interface stickypermmembers extends QueryResultBase {
  userid: Snowflake;
  guildid: Snowflake;
  channelid: Snowflake;
  denybits?: bigint;
  allowbits?: bigint;
}

export interface stickyrolemembers extends QueryResultBase {
  userid: Snowflake;
  guildid: Snowflake;
  roles: Snowflake[];
}

export interface suggestionsettings extends QueryResultBase {
  guildid: Snowflake;
  active: boolean;
  channelid?: Snowflake;
  novoteroles?: Snowflake[];
  novoteusers?: Snowflake[];
  approverroleid?: Snowflake[];
  anon: boolean;
  nosendroles?: Snowflake[];
  nosendusers?: Snowflake[];
}

export interface suggestionvotes extends QueryResultBase {
  guildid: Snowflake;
  msgid: Snowflake;
  authorid: Snowflake;
  downvoted?: Snowflake[];
  upvoted?: Snowflake[];
  ended?: boolean;
}

export interface toxicitycheck extends QueryResultBase {
  guildid: Snowflake;
  userid: Snowflake;
  amount: string;
}

export interface users extends QueryResultBase {
  userid: Snowflake;
  votereminders?: boolean;
}

export interface verification extends QueryResultBase {
  guildid: Snowflake;
  logchannel?: Snowflake;
  finishedrole?: Snowflake;
  pendingrole?: Snowflake;
  startchannel?: Snowflake;
  selfstart: boolean;
  kickafter?: string;
  kicktof: boolean;
  active: boolean;
}

export interface votereminder extends QueryResultBase {
  userid: Snowflake;
  removetime: string;
}

export interface voterewards extends QueryResultBase {
  userid: Snowflake;
  roleid: Snowflake;
  removetime: string;
}

export interface welcome extends QueryResultBase {
  guildid: Snowflake;
  channelid?: Snowflake;
  active: boolean;
  embed: string;
  pingroles?: Snowflake[];
  pingusers?: Snowflake[];
}