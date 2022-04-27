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
        handleApproverVote(cmd, true);
        break;
      }
      case 'deny': {
        handleApproverVote(cmd, false);
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

const getSettings = async (cmd) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM suggestionsettings WHERE guildid = $1 AND active = true;`,
    [cmd.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];

  cmd.client.ch.error(cmd, cmd.language.suggestion.systemDisabled);
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

  const settings = await getSettings(cmd);
  if (!settings) return;

  if (settings.novoteroles?.some((r) => cmd.member.roles.cache.has(r))) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.roleVoteBlacklisted);
    return;
  }
  if (settings.novoteusers?.includes(cmd.user.id)) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.userVoteBlacklisted);
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
    value: `${cmd.client.textEmotes.tickWithBackground}: ${votes.upvoted.length}\n${cmd.client.textEmotes.crossWithBackground}: ${votes.downvoted.length}`,
    inline: false,
  });

  const embeds = [embed];
  if (cmd.message.embeds[1]) embeds.push(cmd.message.embeds[1]);

  cmd.message.edit({ embeds }).catch(() => {});
};

const handleViewVotes = async (cmd) => {
  const votes = await getVotes(cmd);
  if (!votes) return;

  const settings = await getSettings(cmd);
  if (!settings) return;

  if (settings.anon) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.anon);
    return;
  }

  const embeds = [
    new Builders.UnsafeEmbedBuilder()
      .setColor(cmd.client.constants.standard.ephemeralColor)
      .setAuthor({
        iconURL: cmd.client.objectEmotes.tickWithBackground.link,
        name: cmd.language.suggestion.upvotes,
      })
      .setDescription(
        votes.upvoted.length
          ? votes.upvoted.map((v) => `<@${v}>`).join(', ')
          : cmd.language.suggestion.noUpvotes,
      ),
    new Builders.UnsafeEmbedBuilder()
      .setColor(cmd.client.constants.standard.ephemeralColor)
      .setAuthor({
        iconURL: cmd.client.objectEmotes.crossWithBackground.link,
        name: cmd.language.suggestion.downvotes,
      })
      .setDescription(
        votes.downvoted.length
          ? votes.downvoted.map((v) => `<@${v}>`).join(', ')
          : cmd.language.suggestion.noDownvotes,
      ),
  ];

  cmd.client.ch.reply(cmd, { embeds, ephemeral: true }).catch(() => {});
};

const handleApproverVote = async (cmd, isApproved) => {
  const settings = await getSettings(cmd);
  if (!settings) return;

  if (!settings.approverroleid?.some((r) => cmd.member.roles.cache.has(r))) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.noApproverRole);
    return;
  }

  const votes = await getVotes(cmd);
  if (!votes) return;

  let question;
  if (
    (votes.upvoted.length > votes.downvoted.length && !isApproved) ||
    (votes.upvoted.length < votes.downvoted.length && isApproved)
  ) {
    question = cmd.client.ch.stp(cmd.language.suggestion.againstApproverVote, {
      type: isApproved ? cmd.language.suggestion.approve : cmd.language.suggestion.deny,
    });
  } else {
    question = cmd.client.ch.stp(cmd.language.suggestion.approverVote, {
      type: isApproved ? cmd.language.suggestion.approve : cmd.language.suggestion.deny,
    });
  }

  const buttons = cmd.client.ch.buttonRower([
    [
      new Builders.UnsafeButtonBuilder()
        .setLabel(cmd.language.Yes)
        .setCustomId('yes')
        .setStyle(Discord.ButtonStyle.Primary),
      new Builders.UnsafeButtonBuilder()
        .setLabel(cmd.language.No)
        .setCustomId('no')
        .setStyle(Discord.ButtonStyle.Secondary),
    ],
  ]);

  const getReasonModal = (i) =>
    new Builders.UnsafeModalBuilder()
      .setCustomId(`suggestionReason_${i.createdTimestamp}`)
      .setTitle(cmd.language.suggestion.modalTitle)
      .setComponents(
        new Builders.ActionRowBuilder().setComponents(
          new Builders.UnsafeTextInputBuilder()
            .setCustomId('longReason')
            .setLabel(cmd.language.suggestion.reasonInput)
            .setPlaceholder(cmd.language.suggestion.optional)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(false)
            .setMinLength(0)
            .setMaxLength(4000),
        ),
        new Builders.ActionRowBuilder().setComponents(
          new Builders.UnsafeTextInputBuilder()
            .setCustomId('tldrReason')
            .setLabel(cmd.language.suggestion.tldrInput)
            .setPlaceholder(cmd.language.suggestion.optional)
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(false)
            .setMinLength(0)
            .setMaxLength(1000),
        ),
      );

  const m = await cmd.client.ch.reply(cmd, {
    components: buttons,
    content: question,
    ephemeral: true,
    fetchReply: true,
  });
  const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });

  buttonsCollector.on('collect', async (interaction) => {
    buttonsCollector.stop();

    if (interaction.customId === 'yes') {
      const reasonModal = getReasonModal(interaction);
      await interaction.showModal(reasonModal);

      const submit = await interaction
        .awaitModalSubmit({
          filter: (modalSubmit) =>
            modalSubmit.customId === `suggestionReason_${interaction.createdTimestamp}`,
          time: 300000,
        })
        .catch(() => {});

      if (!submit) return;

      const newSettings = await getSettings(cmd);
      if (newSettings?.ended) {
        cmd.client.ch.error(cmd, cmd.language.suggestion.tooSlow);
        return;
      }

      await cmd.client.ch.query(
        `UPDATE suggestionvotes SET ended = true WHERE guildid = $1 AND msgid = $2;`,
        [cmd.guild.id, cmd.message.id],
      );

      const embed = new Builders.UnsafeEmbedBuilder()
        .setTitle(isApproved ? cmd.language.suggestion.approved : cmd.language.suggestion.denied)
        .setColor(
          isApproved ? cmd.client.constants.colors.success : cmd.client.constants.colors.warning,
        );

      if (submit.fields.getField('longReason')?.value.length) {
        embed.setDescription(
          `**${cmd.language.reason}**:\n${submit.fields.getField('longReason').value}`,
        );
      }

      if (submit.fields.getField('tldrReason')?.value.length) {
        embed.addFields({
          name: cmd.language.suggestion.tldr,
          value: `${submit.fields.getField('tldrReason').value}`,
          inline: false,
        });
      }

      await cmd.message
        .edit({ components: [], embeds: [cmd.message.embeds[0], embed] })
        .catch(() => {});

      await submit.update({
        content: isApproved ? cmd.language.suggestion.approved : cmd.language.suggestion.denied,
        components: [],
      });
    } else {
      await interaction.update({ content: cmd.language.aborted, components: [] });
    }
  });
};

const handleDelete = async (cmd) => {
  const areYouSure = async () => {
    const buttons = cmd.client.ch.buttonRower([
      [
        new Builders.UnsafeButtonBuilder()
          .setLabel(cmd.language.Yes)
          .setCustomId('yes')
          .setStyle(Discord.ButtonStyle.Primary),
        new Builders.UnsafeButtonBuilder()
          .setLabel(cmd.language.No)
          .setCustomId('no')
          .setStyle(Discord.ButtonStyle.Secondary),
      ],
    ]);

    const m = await cmd.client.ch.reply(cmd, {
      components: buttons,
      content: cmd.language.suggestion.deleteSure,
      ephemeral: true,
      fetchReply: true,
    });
    const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });

    return new Promise((resolve) => {
      buttonsCollector.on('collect', async (i) => {
        buttonsCollector.stop();

        if (i.customId === 'yes') {
          i.update({ content: cmd.language.suggestion.deleted, components: [] });
          resolve(true);
        } else {
          i.update({ components: [], content: cmd.language.aborted });
          resolve(false);
        }
      });
    });
  };

  const votes = await getVotes(cmd);
  if (!votes) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.noVotes);
    return;
  }

  if (votes.authorid !== cmd.user.id) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.cantDeleteSuggestion);
    return;
  }

  const isSure = await areYouSure();
  if (!isSure) return;

  await cmd.client.ch.query(
    `DELETE FROM suggestionvotes WHERE msgid = $1 AND authorid = $2 AND guildid = $3;`,
    [cmd.message.id, cmd.user.id, cmd.guild.id],
  );

  cmd.message.delete().catch(() => {});
};

const handleEdit = async (cmd) => {
  const votes = await getVotes(cmd);
  if (!votes) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.noVotes);
    return;
  }

  if (votes.authorid !== cmd.user.id) {
    cmd.client.ch.error(cmd, cmd.language.suggestion.cantEditSuggestion);
    return;
  }

  const modal = getEditModal(cmd);
  await cmd.showModal(modal);

  const submit = await cmd
    .awaitModalSubmit({
      filter: (modalSubmit) => modalSubmit.customId === `suggestionEdit_${cmd.createdTimestamp}`,
      time: 300000,
    })
    .catch(() => {});

  if (!submit) return;

  await submit.deferUpdate();

  const embed = new Builders.UnsafeEmbedBuilder(cmd.message.embeds[0].data).setDescription(
    submit.fields.getField('longEdit').value,
  );

  const embeds = [embed];
  if (cmd.message.embeds[1]) embeds.push(cmd.message.embeds[1]);

  cmd.message.edit({ embeds }).catch(() => {});
};

const getEditModal = (cmd) =>
  new Builders.UnsafeModalBuilder()
    .setCustomId(`suggestionEdit_${cmd.createdTimestamp}`)
    .setTitle(cmd.language.suggestion.editTitle)
    .setComponents(
      new Builders.ActionRowBuilder().setComponents(
        new Builders.UnsafeTextInputBuilder()
          .setCustomId('longEdit')
          .setLabel(cmd.language.suggestion.editLabel)
          .setPlaceholder('placeholder')
          .setStyle(Discord.TextInputStyle.Paragraph)
          .setValue(cmd.message.embeds[0].description)
          .setRequired(true)
          .setMinLength(0)
          .setMaxLength(4000),
      ),
    );
