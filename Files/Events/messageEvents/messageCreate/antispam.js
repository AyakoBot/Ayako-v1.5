const client = require('../../../BaseClient/DiscordClient');

const antiSpamSettings = {
  warnThreshold: 7,
  ofwarnThreshold: 10,
  muteThreshold: 13,
  kickThreshold: 16,
  banThreshold: 18,
  maxInterval: 15000,
  maxDuplicatesInterval: 15000,
  maxDuplicatesWarning: 4,
  maxDuplicatesofWarning: 7,
  maxDuplicatesMute: 10,
  maxDuplicatesKick: 13,
  maxDuplicatesBan: 16,
};

let data = {
  messageCache: [],
  bannedUsers: [],
  kickedUsers: [],
  warnedUsers: [],
  ofwarnedUsers: [],
  mutedUsers: [],
  users: [],
};

module.exports = {
  async execute(msg) {
    if (msg.channel.type === 'DM' || msg.author.id === msg.client.user.id || msg.author.bot) return;
    let warnnr;
    let guildSettings;
    const res = await msg.client.ch.query(
      'SELECT * FROM antispamsettings WHERE guildid = $1 AND active = true;',
      [msg.guild.id],
    );
    if (res && res.rowCount > 0) [guildSettings] = res.rows;
    else return;

    const res2 = await msg.client.ch.query(
      'SELECT * FROM warns WHERE guildid = $1 AND userid = $2;',
      [msg.guild.id, msg.author.id],
    );
    if (res2 && res2.rowCount > 0) warnnr = res2.rowCount;
    else warnnr = 1;

    if (!msg.member) return;
    if (msg.member.permissions.has(8n)) return;
    if (guildSettings.bpchannelid && guildSettings.bpchannelid.includes(msg.channel.id)) return;
    if (guildSettings.bpuserid && guildSettings.bpuserid.includes(msg.author.id)) return;
    if (
      guildSettings.bproleid &&
      msg.member.roles.cache.some((role) => guildSettings.bproleid.includes(role.id))
    ) {
      return;
    }

    msg.language = await msg.client.ch.languageSelector(msg.guild);

    const banUser = async () => {
      data.messageCache = data.messageCache.filter((m) => m.author !== msg.author.id);
      data.bannedUsers.push(msg.author.id);
      if (!msg.member.bannable)
        return msg.client.ch.send(
          msg.channel,
          msg.client.ch.stp(msg.language.commands.antispamHandler.banErrorMessage, {
            user: msg.author,
          }),
        );
      return msg.client.emit('antispamBanAdd', msg);
    };

    const kickUser = async () => {
      data.messageCache = data.messageCache.filter((m) => m.author !== msg.author.id);
      data.kickedUsers.push(msg.author.id);
      if (!msg.member.kickable)
        return msg.client.ch.send(
          msg.channel,
          msg.client.ch.stp(msg.language.commands.antispamHandler.kickErrorMessage, {
            user: msg.author,
          }),
        );
      return msg.client.emit('antispamKickAdd', msg);
    };

    const warnUser = async () => {
      data.warnedUsers.push(msg.author.id);
      return msg.client.emit('antispamWarnAdd', msg);
    };

    const muteUser = async () => {
      data.mutedUsers.push(msg.author.id);
      return msg.client.emit('antispamMuteAdd', msg);
    };

    const ofwarnUser = async () => {
      data.ofwarnedUsers.push(msg.author.id);
      if (guildSettings.readofwarnstof === true) {
        if (warnnr === guildSettings.banafterwarnsamount && guildSettings.banenabledtof === true)
          await kickUser(msg);
        else if (
          warnnr === guildSettings.kickafterwarnsamount &&
          guildSettings.kickenabledtof === true
        )
          await banUser(msg);
        else if (
          warnnr === guildSettings.muteafterwarnsamount &&
          guildSettings.muteenabledtof === true
        )
          await muteUser(msg);
        else msg.client.emit('antispamOfwarnAdd', msg);
      }
      if (guildSettings.readofwarnstof === false) msg.client.emit('ofwarnAdd', msg);
    };

    data.messageCache.push({
      content: msg.content,
      author: msg.author.id,
      time: Date.now(),
    });
    const messageMatches = data.messageCache.filter(
      (m) =>
        m.time > Date.now() - antiSpamSettings.maxDuplicatesInterval &&
        m.content === msg.content &&
        m.author === msg.author.id,
    ).length;
    const spamMatches = data.messageCache.filter(
      (m) => m.time > Date.now() - antiSpamSettings.maxInterval && m.author === msg.author.id,
    ).length;

    if (
      !data.warnedUsers.includes(msg.author.id) &&
      (spamMatches === antiSpamSettings.warnThreshold ||
        messageMatches === antiSpamSettings.maxDuplicatesWarning)
    ) {
      warnUser(msg);
      return;
    }
    if (
      !data.mutedUsers.includes(msg.author.id) &&
      (spamMatches === antiSpamSettings.muteThreshold ||
        messageMatches === antiSpamSettings.maxDuplicatesMute) &&
      guildSettings.muteenabledtof === true
    ) {
      muteUser(msg);
      return;
    }
    if (
      !data.ofwarnedUsers.includes(msg.author.id) &&
      (spamMatches === antiSpamSettings.ofwarnThreshold ||
        messageMatches === antiSpamSettings.maxDuplicatesofWarning) &&
      guildSettings.giveofficialwarnstof === true
    ) {
      ofwarnUser(msg);
      return;
    }
    if (
      !data.kickedUsers.includes(msg.author.id) &&
      (spamMatches === antiSpamSettings.kickThreshold ||
        messageMatches === antiSpamSettings.maxDuplicatesKick) &&
      guildSettings.kickenabledtof === true
    ) {
      kickUser(msg);
      return;
    }
    if (
      spamMatches === antiSpamSettings.banThreshold ||
      (messageMatches === antiSpamSettings.maxDuplicatesBan && guildSettings.banenabledtof === true)
    ) {
      banUser(msg);
    }
  },
  resetData() {
    client.ch.logger(
      `AntiSpam Data Clear\nCleared a total of ${data.messageCache.length} messages`,
      `messageCache: ${data.messageCache.length}\nofwarnedUsers: ${data.ofwarnedUsers.length}\nmutedUsers: ${data.mutedUsers.length}\nbannedUsers: ${data.bannedUsers.length}\nkickedUsers: ${data.kickedUsers.length}\nwarnedUsers: ${data.warnedUsers.length}`,
    );
    data = {
      messageCache: [],
      ofwarnedUsers: [],
      mutedUsers: [],
      bannedUsers: [],
      kickedUsers: [],
      warnedUsers: [],
    };
  },
};
