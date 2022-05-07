const Builders = require('@discordjs/builders');

module.exports = {
  name: 'giveaway',
  split: /_+/,
  needsLanguage: true,
  execute: async (cmd, language) => {
    const lan = language.slashCommands.giveaway.participate;
    const giveaway = await getGiveaway(cmd);
    if (!giveaway) return;

    if (giveaway.reqrole && !cmd.member.roles.cache.has(giveaway.reqrole)) {
      cmd.client.ch.error(cmd, lan.cantEnter);
      return;
    }

    if (!giveaway.participants) giveaway.participants = [];

    if (giveaway.participants.includes(cmd.user.id)) {
      giveaway.participants.splice(giveaway.participants.indexOf(cmd.user.id), 1);
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(cmd.client.constants.colors.warning)
        .setDescription(lan.left);

      cmd.client.ch.reply(cmd, { embeds: [embed], ephemeral: true });
    } else {
      giveaway.participants.push(cmd.user.id);
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(cmd.client.constants.colors.success)
        .setDescription(lan.entered);

      cmd.client.ch.reply(cmd, { embeds: [embed], ephemeral: true });
    }

    const embed = new Builders.UnsafeEmbedBuilder(cmd.message.embeds[0].data).setTitle(
      `${giveaway.participants.length} ${lan.participants}`,
    );
    await cmd.message.edit({ embeds: [embed] }).catch(() => {});

    await cmd.client.ch.query(
      `UPDATE giveaways SET participants = $1 WHERE msgid = $2 AND guildid = $3;`,
      [giveaway.participants, cmd.message.id, cmd.guild.id],
    );
  },
};

const getGiveaway = async (cmd) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM giveaways WHERE msgid = $1 AND guildid = $2 AND ended = false;`,
    [cmd.message.id, cmd.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
