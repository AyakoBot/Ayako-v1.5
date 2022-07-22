const queue = [];

module.exports = {
  execute: async (reaction, user) => {
    if (user.id === reaction.client.user.id) return;
    if (!reaction.message.guild) return;

    const emoteIdentifier =
      reaction.emoji.id?.replace(/\s/g, '') || reaction.emoji.name?.replace(/\s/g, '');

    const reactionRow = await getReactionRow(reaction, emoteIdentifier);
    if (!reactionRow) return;

    const baseRow = await getBaseRow(reaction, reactionRow);
    if (!baseRow) return;

    const member = await reaction.message.guild.members.fetch(user.id).catch(() => {});
    if (!member) return;

    const relatedReactions = await getRelatedReactions(reaction, baseRow);
    const related = getHasAnyOfRelated(relatedReactions, member);

    if (reactionRow.roles) {
      giveRoles(reactionRow, baseRow, related, member);
      takeRelated(related, member, baseRow, reaction);
    }
  },
};

const getBaseRow = async (reaction, reactionRow) => {
  const res = await reaction.client.ch.query(
    `SELECT * FROM rrsettings WHERE messagelink = $1 AND guildid = $2 AND active = true;`,
    [reactionRow.messagelink, reaction.message.guild.id],
  );

  if (!res || !res.rowCount) return [];
  return res.rows[0];
};

const getRelatedReactions = async (reaction, baseRow) => {
  const res = await reaction.client.ch.query(
    `SELECT * FROM rrbuttons WHERE guildid = $1 AND messagelink = $2 AND active = true;`,
    [reaction.message.guild.id, baseRow.messagelink],
  );

  const reactionRows = await getReactionRows(reaction);
  const buttonRows = res ? res.rows : [];

  return [...reactionRows, ...buttonRows];
};

const getHasAnyOfRelated = (relatedReactions, member) => {
  if (!relatedReactions || !relatedReactions.length) return false;

  const related = [];

  relatedReactions.forEach((row) => {
    row.roles.forEach((role) => {
      if (member.roles.cache.has(role)) related.push(role);
    });
  });

  return related;
};

const giveRoles = (reactionRow, baseRow, relatedRoles, member) => {
  const rolesToAdd = [];

  reactionRow.roles.forEach((rID) => {
    if (!member.roles.cache.has(rID)) rolesToAdd.push(rID);
  });

  if (relatedRoles && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (!member.roles.cache.has(rID)) rolesToAdd.push(rID);
    });
  }

  if (rolesToAdd.length) queue.push({ member, roles: rolesToAdd });
};

const takeRelated = async (relatedRoles, member, baseRow, reaction) => {
  if (baseRow.onlyone !== true) return;

  relatedRoles.forEach((r) => {
    if (member.roles.cache.has(r)) member.roles.remove(r).catch(() => {});
  });

  const [, , , , channelid, msgid] = baseRow.messagelink.split(/\/+/);
  const m = await member.client.channels.cache.get(channelid).messages.fetch(msgid);
  m.reactions.cache.forEach(async (r) => {
    await r.users.fetch().catch(() => {});
    if (r.users.cache.has(member.id)) {
      if (
        (r._emoji.id && r._emoji.id !== reaction._emoji.id) ||
        (!r._emoji.id && r._emoji.name !== reaction._emoji.name)
      ) {
        r.users.remove(member.id).catch(() => {});
      }
    }
  });
};

const getReactionRow = async (reaction, emoteIdentifier) => {
  const res = await reaction.client.ch.query(
    'SELECT * FROM rrreactions WHERE messagelink = $1 AND emoteid = $2 AND guildid = $3 AND active = true;',
    [reaction.message.url, emoteIdentifier, reaction.message.guild.id],
  );

  if (!res || !res.rowCount) return [];
  return res.rows[0];
};

const getReactionRows = async (reaction) => {
  const res = await reaction.client.ch.query(
    'SELECT * FROM rrreactions WHERE messagelink = $1 AND guildid = $2 AND active = true;',
    [reaction.message.url, reaction.message.guild.id],
  );

  if (!res || !res.rowCount) return [];
  return res.rows;
};

setInterval(() => {
  if (!queue.length) return;

  const { member, roles } = queue.shift();

  queue
    .filter(({ member: m }) => m.user.id === member.user.id && m.guild.id === member.guild.id)
    .forEach(({ roles: r }) => {
      roles.push(...r);
    });

  const indexes = [];
  queue.forEach(({ member: m }, i) =>
    m.user.id === member.user.id && m.guild.id === member.guild.id ? indexes.push(i) : null,
  );
  indexes.forEach((index) => queue.splice(index, 1));

  member.roles.add(roles).catch(() => {});
}, 500);
