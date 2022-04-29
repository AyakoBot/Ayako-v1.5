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

    const relatedReactions = await getRelatedReactions(reaction, baseRow, reactionRow);
    const hasAnyOfRelated = getHasAnyOfRelated(relatedReactions, member);

    takeRoles(reactionRow, baseRow, hasAnyOfRelated, member);
  },
};

const getBaseRow = async (reaction, reactionRow) => {
  const res = await reaction.client.ch.query(
    `SELECT * FROM rrsettings WHERE messagelink = $1 AND guildid = $2 AND active = true;`,
    [reactionRow.messagelink, reaction.message.guild.id],
  );

  if (!res || !res.rowCount) return null;
  return res.rows[0];
};

const getRelatedReactions = async (reaction, baseRow, reactionRow) => {
  const res = await reaction.client.ch.query(
    `SELECT * FROM rrbuttons WHERE guildid = $1 AND messagelink = $2 AND uniquetimestamp != $3 AND active = true;`,
    [reaction.message.guild.id, baseRow.messagelink, reactionRow.uniquetimestamp],
  );

  if (!res || !res.rowCount) return null;
  return res.rows;
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

const takeRoles = async (reactionRow, baseRow, hasAnyOfRelated, member) => {
  const rolesToRemove = [];

  reactionRow.roles.forEach((rID) => {
    if (member.roles.cache.has(rID)) rolesToRemove.push(rID);
  });

  if (!hasAnyOfRelated && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (member.roles.cache.has(rID)) rolesToRemove.push(rID);
    });
  }

  if (rolesToRemove.length) {
    await member.roles.remove(rolesToRemove).catch(() => {});
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
