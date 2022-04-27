const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'suggestion',
  split: /_+/,
  needsLang: true,
  execute: async (cmd) => {
    const [type] = cmd.args;

    switch (type) {
      case 'upvote': {
        handleVote(cmd, true);
        break;
      }
      case 'downvote': {
        handleVote(cmd, false);
        break;
      }
      case 'viewVotes': {
        handleViewVotes(cmd);
        break;
      }
      case 'approve': {
        handleApprove(cmd);
        break;
      }
      case 'deny': {
        handleDeny(cmd);
        break;
      }
      case 'edit': {
        handleEdit(cmd);
        break;
      }
      case 'delete': {
        handleDelete(cmd);
        break;
      }
      default: {
        break;
      }
    }
  },
};

const getVotes = async (cmd) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM suggestionvotes WHERE guildid = $1 AND msgid = $2;`,
    [cmd.guild.id, cmd.message.id],
  );

  if (res && res.rowCount) return res.rows[0];

  cmd.client.ch.error(cmd, cmd.language.suggestion.unkownSuggestion);
  return null;
};

const handleVote = async (cmd, isUp) => {
  const votes = await getVotes(cmd);
  if (!votes) return;

  if (votes.ended) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.ended);
    return;
  }

  if (votes.authorid === cmd.user.id) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.voteSelf);
    return;
  }

  const type = isUp ? 'upvoted' : 'downvoted';
  const oppositeType = !isUp ? 'upvoted' : 'downvoted';

  let action;
  if (votes[type].includes(cmd.user.id)) {
    votes[type].splice(votes[type].indexOf(cmd.user.id), 1);
    action = cmd.language.suggestion[type].removed;
  } else if (!votes[type].includes(cmd.user.id)) {
    votes[type].push(cmd.user.id);
    action = cmd.language.suggestion[type].added;

    if (votes[oppositeType].includes(cmd.user.id)) {
      votes[oppositeType].splice(votes[oppositeType].indexOf(cmd.user.id), 1);
      action += `\n${cmd.language.suggestion[oppositeType].removed}`;
    }
  }

  cmd.reply({ content: action, ephemeral: true }).catch(() => {});

  cmd.client.ch.query(
    `UPDATE suggestionvotes SET upvoted = $1, downvoted = $2 WHERE guildid = $3 AND msgid = $4;`,
    [votes.upvoted, votes.downvoted, cmd.guild.id, cmd.message.id],
  );

  updateVoteCount(cmd, votes);
};

const updateVoteCount = (cmd, votes) => {
  const embed = new Builders.UnsafeEmbedBuilder(cmd.message.embeds[0].data);
  embed.data.fields.pop();

  embed.addFields({
    name: cmd.language.suggestion.votes,
    value: `${cmd.client.textEmotes.tickBG}: ${votes.upvoted.length}\n${cmd.client.textEmotes.crossBG}: ${votes.downvoted.length}`,
    inline: false,
  });

  cmd.message.edit({ embeds: [embed] }).catch(() => {});
};
