import type { QueryResultBase } from 'pg';

// Tables
export interface afk extends QueryResultBase {
  userid: string;
  guildid: string;
  text: string;
  since: string;
}

export interface antiraidsettings extends QueryResultBase {
  guildid: string;
  active: boolean;
  punishment: boolean;
  posttof?: boolean;
  postchannel?: string;
  pingroles?: string[];
  pingusers?: string[];
  time: string;
  jointhreshold: string;
  punishmenttof?: boolean;
}

export interface antispamsettings extends QueryResultBase {
  guildid: string;
  active: boolean;
  giveofficialwarnstof: boolean;
  muteafterwarnsamount: string;
  kickafterwarnsamount: string;
  banafterwarnsamount: string;
  muteenabledtof: boolean;
  kickenabledtof: boolean;
  baneneabledtof: boolean;
  readofwarnstof: boolean;
  bpuserid?: string[];
  bproleid?: string[];
  bpchannelid?: string[];
  forcedisabled?: boolean;
}

export interface antivirus extends QueryResultBase {
  guildid: string;
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
  linklogchannels?: string[];
}

export interface antiviruslog extends QueryResultBase {
  guildid: string;
  userid: string;
  type: string;
  date: string;
}

export interface autopunish extends QueryResultBase {
  guildid: string;
  uniquetimestamp: string;
  duration?: string;
  warnamount: string;
  punishment?: string;
  active: boolean;
  addroles?: string[];
  removeroles?: string[];
  sendtof: boolean;
  sendchannels?: string[];
  confirmationreq: boolean;
}

export interface autorole extends QueryResultBase {
  guildid: string;
  active: boolean;
  botroleid?: string[];
  userroleid?: string[];
  allroleid?: string[];
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
  bpchannelid?: string[];
  bproleid?: string[];
  bpuserid?: string[];
  words?: string[];
  guildid: string;
  mutetof: boolean;
}

export interface cooldowns extends QueryResultBase {
  command: string;
  cooldown: string;
  active: boolean;
  bpchannelid?: string[];
  bproleid?: string[];
  bpuserid?: string[];
  activechannelid?: string[];
  uniquetimestamp: string;
  guildid: string;
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
  guildid: string;
  name?: string;
}

export interface deletecommands extends QueryResultBase {
  uniquetimestamp: string;
  guildid: string;
  deletecommand: boolean;
  deletereply: boolean;
  deletetimeout?: string;
  active: boolean;
  commands: string[];
}

export interface disabledcommands extends QueryResultBase {
  guildid: string;
  active: boolean;
  commands?: string[];
  channels?: string[];
  bproleid?: string[];
  blroleid?: string[];
  bpuserid?: string[];
  bluserid?: string[];
  bpchannelid?: string[];
  blchannelid?: string[];
  uniquetimestamp: string;
}

export interface disboard extends QueryResultBase {
  guildid: string;
  active: boolean;
  nextbump?: string;
  channelid?: string;
  repeatreminder?: string;
  roles?: string[];
  users?: string[];
  rempchannelid?: string;
  deletereply: boolean;
  msgid?: string;
}

export interface giveaways extends QueryResultBase {
  guildid: string;
  msgid: string;
  description: string;
  winnercount: string;
  endtime: string;
  reqrole?: string;
  actualprize?: string;
  host: string;
  ended: boolean;
  channelid: string;
  participants?: string[];
}

export interface guildsettings extends QueryResultBase {
  guildid: string;
  prefix?: string;
  interactionsmode: boolean;
  lan: string;
  errorchannel?: string;
  vanity?: string;
}

export interface level extends QueryResultBase {
  userid: string;
  guildid: string;
  type: string;
  xp: string;
  level?: string;
}

export interface leveling extends QueryResultBase {
  guildid: string;
  active: boolean;
  xpmultiplier: string;
  blchannels?: string[];
  blroles?: string[];
  blusers?: string[];
  wlchannels?: string[];
  wlroles?: string[];
  wlusers?: string[];
  xppermsg: string;
  rolemode: boolean;
  lvlupmode?: string;
  lvlupdeltimeout?: string;
  lvlupchannels?: string[];
  lvlupemotes?: (string | string)[];
  embed?: string;
  ignoreprefixes: boolean;
  prefixes?: string[];
}

export interface levelingmultiplierchannels extends QueryResultBase {
  guildid: string;
  channels?: string[];
  multiplier: string;
  uniquetimestamp: string;
}

export interface levelingmultiroles extends QueryResultBase {
  guildid: string;
  roles?: string[];
  multiplier: string;
  uniquetimestamp: string;
}

export interface levelingroles {
  guildid: string;
  level?: string;
  roles?: string[];
  uniquetimestamp: string;
}

export interface levelingruleschannels extends QueryResultBase {
  guildid: string;
  channels?: string[];
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
  guildid: string;
  emojievents?: string[];
  guildevents?: string[];
  inviteevents?: string[];
  messageevents?: string[];
  modlogs?: string[];
  roleevents?: string[];
  userevents?: string[];
  voiceevents?: string[];
  webhookevents?: string[];
  settingslog?: string[];
  channelevents?: string[];
  stageinstanceevents?: string[];
  stickerevents?: string[];
  threadevents?: string[];
  guildmemberevents?: string[];
}

export interface modroles extends QueryResultBase {
  guildid: string;
  roleid: string;
  perms?: bigint;
  whitelistedcommands?: string[];
  whitelistedusers?: string[];
  whitelistedroles?: string[];
  blacklistedroles?: string[];
  blacklistedusers?: string[];
  active: boolean;
  blacklistedcommands?: string[];
  uniquetimestamp: string;
  mutedurationdefault?: string;
}

export interface modsettings extends QueryResultBase {
  guildid: string;
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
  guildid: string;
  uniquetimestamp: string;
  roles?: string[];
  days?: string;
}

export interface nitrosettings extends QueryResultBase {
  guildid: string;
  active: boolean;
  logchannels?: string[];
  rolemode: boolean;
}

export interface nitrousers extends QueryResultBase {
  guildid: string;
  userid: string;
  booststart: string;
  boostend?: string;
}

export interface policy_guilds extends QueryResultBase {
  guildid: string;
}

export interface policy_users extends QueryResultBase {
  userid: string;
}

export interface punish_bans extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration?: string;
}

export interface punish_channelbans extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration?: string;
}

export interface punish_kicks extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
}

export interface punish_mutes extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration?: string;
}

export interface punish_tempbans extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration: string;
}

export interface punish_tempchannelbans extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration: string;
}

export interface punish_tempmutes extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
  duration: string;
}

export interface punish_warns extends QueryResultBase {
  guildid: string;
  userid: string;
  reason?: string;
  uniquetimestamp: string;
  channelid: string;
  channelname: string;
  executorid: string;
  executorname: string;
  msgid: string;
}

export interface reminders extends QueryResultBase {
  userid: string;
  channelid: string;
  reason: string;
  uniquetimestamp: string;
  endtime: string;
  msgid: string;
}

export interface roleseparator extends QueryResultBase {
  guildid: string;
  separator: string;
  active: boolean;
  stoprole?: string;
  isvarying: boolean;
  roles?: string[];
  uniquetimestamp: string;
}

export interface roleseparatorsettings extends QueryResultBase {
  guildid: string;
  stillrunning: boolean;
  channelid?: string;
  messageid?: string;
  duration?: string;
  startat?: string;
  index?: string;
  length?: string;
}

export interface rrbuttons extends QueryResultBase {
  uniquetimestamp: string;
  roles?: string[];
  emoteid?: string;
  buttontext?: string;
  active: boolean;
  messagelink: string;
  guildid: string;
}

export interface rrreactions extends QueryResultBase {
  uniquetimestamp: string;
  emoteid: string;
  roles?: string[];
  active: boolean;
  messagelink: string;
  guildid: string;
}

export interface rrsettings extends QueryResultBase {
  guildid: string;
  messagelink: string;
  uniquetimestamp: string;
  name: string;
  onlyone?: boolean;
  active: boolean;
  anyroles?: string[];
}

export interface selfroles extends QueryResultBase {
  guildid: string;
  roles?: string[];
  onlyone?: boolean;
  uniquetimestamp: string;
  blacklistedroles?: string[];
  blacklistedusers?: string[];
  whitelistedroles?: string[];
  whitelistedusers?: string[];
  active: boolean;
}

export interface stats extends QueryResultBase {
  usercount: string;
  guildcount: string;
  channelcount: string;
  rolecount: string;
  allusers: string;
  willis?: string[];
  count?: string;
  antispam: boolean;
  verbosity: boolean;
  heartbeat: string;
}

export interface statschannel extends QueryResultBase {
  guildid: string;
  channelid: string;
  type?: string;
}

export interface sticky extends QueryResultBase {
  guildid: string;
  roles?: string[];
  stickyrolesmode: boolean;
  stickyrolesactive: boolean;
  stickypermsactive: boolean;
}

export interface stickypermmembers extends QueryResultBase {
  userid: string;
  guildid: string;
  channelid: string;
  denybits?: bigint;
  allowbits?: bigint;
}

export interface stickyrolemembers extends QueryResultBase {
  userid: string;
  guildid: string;
  roles: string[];
}

export interface suggestionsettings extends QueryResultBase {
  guildid: string;
  active: boolean;
  channelid?: string;
  novoteroles?: string[];
  novoteusers?: string[];
  approverroleid?: string[];
  anon: boolean;
  nosendroles?: string[];
  nosendusers?: string[];
}

export interface suggestionvotes extends QueryResultBase {
  guildid: string;
  msgid: string;
  authorid: string;
  downvoted?: string[];
  upvoted?: string[];
  ended?: boolean;
}

export interface toxicitycheck extends QueryResultBase {
  guildid: string;
  userid: string;
  amount: string;
}

export interface users extends QueryResultBase {
  userid: string;
  votereminders?: boolean;
}

export interface verification extends QueryResultBase {
  guildid: string;
  logchannel?: string;
  finishedrole?: string;
  pendingrole?: string;
  startchannel?: string;
  selfstart: boolean;
  kickafter?: string;
  kicktof: boolean;
  active: boolean;
}

export interface votereminder extends QueryResultBase {
  userid: string;
  removetime: string;
}

export interface voterewards extends QueryResultBase {
  userid: string;
  roleid: string;
  removetime: string;
}

export interface welcome extends QueryResultBase {
  guildid: string;
  channelid?: string;
  active: boolean;
  embed: string;
  pingroles?: string[];
  pingusers?: string[];
}