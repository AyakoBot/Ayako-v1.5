const queue = [];

module.exports = {
  execute: async (reaction, user) => {
    if (user.id === reaction.client.user.id) return;
    if (!reaction.message.guild) return;

    const emoteIdentifier = reaction.emoji.name.match(reaction.client.ch.regexes.emojiTester)
      ? reaction.emoji.name
      : reaction.emoji.id;

    const reactionRow = await getReactionRow(reaction, emoteIdentifier);
    if (!reactionRow) return;

    const baseRow = await getBaseRow(reaction, reactionRow);
    if (!baseRow) return;

    const member = await reaction.message.guild.members.fetch(user.id).catch(() => {});
    if (!member) return;

    const relatedReactions = await getRelatedReactions(reaction, baseRow);
    const hasAnyOfRelated = getHasAnyOfRelated(relatedReactions, member);

    if (
      (!hasAnyOfRelated && baseRow.onlyone && reactionRow.roles) ||
      (!baseRow.onlyone && reactionRow.roles)
    ) {
      giveRoles(reactionRow, baseRow, hasAnyOfRelated, member);
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

  let hasAnyOfRelated = false;

  relatedReactions.forEach((row) => {
    row.roles.forEach((role) => {
      if (hasAnyOfRelated) return;
      if (member.roles.cache.has(role)) hasAnyOfRelated = true;
    });
  });

  return hasAnyOfRelated;
};

const giveRoles = (reactionRow, baseRow, hasAnyOfRelated, member) => {
  const rolesToAdd = [];

  reactionRow.roles.forEach((rID) => {
    if (!member.roles.cache.has(rID)) rolesToAdd.push(rID);
  });

  if (hasAnyOfRelated && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (!member.roles.cache.has(rID)) rolesToAdd.push(rID);
    });
  }

  if (rolesToAdd.length) {
    queue.push({ member, roles: rolesToAdd });
  }
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
