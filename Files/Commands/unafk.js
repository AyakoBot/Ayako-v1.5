const Builders = require('@discordjs/builders');

module.exports = {
  name: 'unafk',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  execute: async (msg) => {
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) {
      msg.client.ch.error(msg, msg.language.noUser);
      return;
    }

    const afkRes = await getAFK(msg, user);
    if (!afkRes) {
      msg.client.ch.reply(msg, msg.lan.notAfk);
      return;
    }

    await msg.client.ch.query(`DELETE FROM afk WHERE userid = $1 AND guildid = $2;`, [
      user.id,
      msg.guild.id,
    ]);

    deleteNickname(
      msg,
      user,
      msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : msg.lan.reason,
    );

    const embed = new Builders.UnsafeEmbedBuilder()
      .setColor(msg.client.constants.colors.warning)
      .setDescription(msg.client.ch.stp(msg.lan.afkDeleted, { user }));

    msg.client.ch.reply(msg, { embeds: [embed] });

    const reason = `${msg.author.tag} | ${
      msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : msg.lan.reason
    }`;

    const log = new Builders.UnsafeEmbedBuilder()
      .setColor(msg.client.constants.colors.warning)
      .setAuthor({
        name: msg.lan.author,
        iconURL: user.displayAvatarURL({ size: 4096 }),
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.client.ch.stp(msg.lan.desc, { user: msg.author, target: user }))
      .setTimestamp()
      .addFields({ name: msg.language.reason, value: `${reason}` })
      .setFooter({ text: msg.client.ch.stp(msg.lan.footer, { user: msg.author, target: user }) });
    if (msg.logchannels && msg.logchannels.length) {
      msg.client.ch.send(msg.logchannels, { embeds: [log] });
    }
  },
};

const getAFK = async (msg, user) => {
  const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = $1 AND guildid = $2;`, [
    user.id,
    msg.guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const deleteNickname = async (msg, user, reason) => {
  const member = await getMember(msg, user);

  if (!member) return;
  if (!member.displayName || !member.displayName.endsWith(' [AFK]')) return;

  const newNickname = member.displayName.slice(0, member.displayName.length - 6);
  if (!msg.guild.me.permissions.has(134217728n) || !msg.member.manageable) return;
  member
    .setNickname(
      newNickname,
      msg.client.ch.stp(msg.language.commands.afkHandler.forceDelAfk, { user: msg.author, reason }),
    )
    .catch(() => {});
};

const getMember = async (msg, user) => {
  let member = msg.guild.members.cache.get(user.id);
  if (!member) member = await msg.guild.members.fetch(user.id).catch(() => {});
  return member;
};
