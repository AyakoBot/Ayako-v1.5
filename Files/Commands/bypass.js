const Builders = require('@discordjs/builders');

module.exports = {
  name: 'bypass',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  execute: async (msg) => {
    const member = await msg.guild.members.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!member) {
      msg.client.ch.error(msg, msg.language.errors.memberNotFound);
      return;
    }

    const settings = await getSettings(msg);
    if (!settings) {
      msg.client.ch.error(msg, msg.language.errors.notEnabled);
      return;
    }

    const pendingRole = msg.guild.roles.cache.get(settings.pendingrole);
    const finishedRole = msg.guild.roles.cache.get(settings.finishedrole);

    if (pendingRole && member.roles.cache.has(pendingRole.id)) {
      member.roles.remove(pendingRole, 'bypass').catch(() => {});
    }

    if (finishedRole && !member.roles.cache.has(finishedRole.id)) {
      member.roles.add(finishedRole).catch(() => {});
    }
    doLog(msg, settings, member);

    msg.client.ch.send(member.user, { content: msg.lan.bypass });
  },
};

const getSettings = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM verification WHERE active = true AND guildid = $1;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};

const doLog = (msg, settings, member) => {
  const logChannel = msg.guild.channels.cache.get(settings.logchannel);
  if (!logChannel) return;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(msg.client.ch.stp(msg.language.verification?.log?.end, { user: member.user }))
    .setAuthor({
      name: member.user.tag,
      iconURL: member.user.displayAvatarURL({ size: 4096 }),
    })
    .setTimestamp()
    .setColor();

  msg.client.ch.send(logChannel, { embeds: [embed] }, 5000);
};
