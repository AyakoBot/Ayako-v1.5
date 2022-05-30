module.exports = {
  name: 'rrbuttons',
  split: true,
  needsLanguage: false,
  execute: async (cmd) => {
    const reactionRow = await getReactionRow(cmd);
    if (!reactionRow) return;

    const baseRow = await getBaseRow(cmd, reactionRow);
    if (!baseRow) return;

    const relatedReactions = await getRelatedReactions(cmd, baseRow, reactionRow);
    const hasAnyOfRelated = getHasAnyOfRelated(cmd, relatedReactions);

    const hasOne = cmd.member.roles.cache.some((r) => reactionRow.roles.includes(r.id));

    if (hasOne) {
      takeRoles(cmd, reactionRow, baseRow, hasAnyOfRelated);
    }

    if (!hasOne) {
      giveRoles(cmd, reactionRow, baseRow, hasAnyOfRelated);
    }
  },
};

const getBaseRow = async (cmd, reactionRow) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM rrsettings WHERE messagelink = $1 AND guildid = $2;`,
    [reactionRow.messagelink, cmd.guild.id],
  );

  if (!res || !res.rowCount) return null;
  return res.rows[0];
};

const getReactionRow = async (cmd) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM rrbuttons WHERE uniquetimestamp = $1 AND guildid = $2;`,
    [cmd.args[0], cmd.guild.id],
  );

  if (!res || !res.rowCount) return null;
  return res.rows[0];
};

const getRelatedReactions = async (cmd, baseRow, reactionRow) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM rrbuttons WHERE guildid = $1 AND messagelink = $2 AND uniquetimestamp != $3;`,
    [cmd.guild.id, baseRow.messagelink, reactionRow.uniquetimestamp],
  );

  if (!res || !res.rowCount) return null;
  return res.rows;
};

const getHasAnyOfRelated = (cmd, relatedReactions) => {
  if (!relatedReactions || !relatedReactions.length) return false;

  let hasAnyOfRelated = false;

  relatedReactions.forEach((row) => {
    row.roles.forEach((role) => {
      if (hasAnyOfRelated) return;
      if (cmd.member.roles.cache.has(role)) hasAnyOfRelated = true;
    });
  });

  return hasAnyOfRelated;
};

const takeRoles = async (cmd, reactionRow, baseRow, hasAnyOfRelated) => {
  const rolesToRemove = [];

  reactionRow.roles.forEach((rID) => {
    if (cmd.member.roles.cache.has(rID)) rolesToRemove.push(rID);
  });

  if (!hasAnyOfRelated && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (cmd.member.roles.cache.has(rID)) rolesToRemove.push(rID);
    });
  }

  if (rolesToRemove.length) {
    await cmd.member.roles.remove(rolesToRemove).catch(() => {});
  }
  await cmd.deferUpdate().catch(() => {});
};

const giveRoles = async (cmd, reactionRow, baseRow, hasAnyOfRelated) => {
  const rolesToAdd = [];

  reactionRow.roles.forEach((rID) => {
    if (!cmd.member.roles.cache.has(rID)) rolesToAdd.push(rID);
  });

  if (hasAnyOfRelated && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (!cmd.member.roles.cache.has(rID)) rolesToAdd.push(rID);
    });
  }

  if (rolesToAdd.length) {
    await cmd.member.roles.add(rolesToAdd).catch(() => {});
  }
  await cmd.deferUpdate().catch(() => {});
};
