import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message, reaction: Eris.Emoji, user: Eris.User) => {
  if (user.id === client.user.id) return;
  if (!msg.guild) return;

  const emoteIdentifier = reaction.name.match(client.ch.regexes.emojiTester)
    ? reaction.name
    : reaction.id;

  const baseRow = await getBaseRow(msg);
  if (!baseRow) return;

  const reactionRows = await getReactionRows(msg, emoteIdentifier);
  if (!reactionRows) return;

  const member = msg.guild.members.get(user.id);
  if (!member) return;

  const relatedReactions = await getRelatedReactions(msg, reactionRows);
  const hasAnyOfRelated = getHasAnyOfRelated(relatedReactions, member);

  reactionRows.forEach((reactionRow) => {
    removeRoles(reactionRow, baseRow, hasAnyOfRelated, member);
  });
};

const getBaseRow = (msg: CT.Message) =>
  client.ch
    .query(`SELECT * FROM rrsettings WHERE messagelink = $1 AND guildid = $2 AND active = true;`, [
      msg.jumpLink,
      msg.guildID,
    ])
    .then((r: DBT.rrsettings[] | null) => (r ? r[0] : null));

const getReactionRows = (msg: CT.Message, emoteIdentifier: string) =>
  client.ch
    .query(
      'SELECT * FROM rrreactions WHERE messagelink = $1 AND emoteid = $2 AND guildid = $3 AND active = true;',
      [msg.jumpLink, emoteIdentifier, msg.guildID],
    )
    .then((r: DBT.rrreactions[] | null) => r || null);

const getRelatedReactions = async (msg: CT.Message, reactionRows: DBT.rrreactions[]) => {
  const buttonRows = await client.ch
    .query(`SELECT * FROM rrbuttons WHERE guildid = $1 AND messagelink = $2 AND active = true;`, [
      msg.guildID,
      msg.jumpLink,
    ])
    .then((r: DBT.rrbuttons[] | null) => r || []);

  return [...reactionRows, ...buttonRows];
};

const getHasAnyOfRelated = (
  relatedReactions: (DBT.rrreactions | DBT.rrbuttons)[],
  member: Eris.Member,
) => {
  if (!relatedReactions || !relatedReactions.length) return false;

  let hasAnyOfRelated = false;

  relatedReactions.forEach((row) => {
    row.roles?.forEach((role) => {
      if (hasAnyOfRelated) return;
      if (member.roles.includes(role)) hasAnyOfRelated = true;
    });
  });

  return hasAnyOfRelated;
};

const removeRoles = async (
  reactionRow: DBT.rrreactions,
  baseRow: DBT.rrsettings,
  hasAnyOfRelated: boolean,
  member: Eris.Member,
) => {
  const rolesToRemove: string[] = [];

  reactionRow.roles?.forEach((rID) => {
    if (!member.roles.includes(rID)) rolesToRemove.push(rID);
  });

  if (hasAnyOfRelated && baseRow.anyroles && baseRow.anyroles.length) {
    baseRow.anyroles.forEach((rID) => {
      if (!member.roles.includes(rID)) rolesToRemove.push(rID);
    });
  }

  if (rolesToRemove.length) {
    const language = await client.ch.languageSelector(member.guild.id);
    client.ch.roleManager.remove(
      member,
      rolesToRemove,
      language.events.messageReactionRemove.rrReason,
    );
  }
};
