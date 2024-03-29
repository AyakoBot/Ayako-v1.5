const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'vote_reminder_enable',
  split: false,
  execute: async (cmd) => {
    cmd.client.ch.query(
      `INSERT INTO users (userid, votereminders, username, avatar, lastfetch) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (userid) DO
        UPDATE SET votereminders = $2;`,
      [
        cmd.user.id,
        true,
        cmd.user.username,
        cmd.user.displayAvatarUrl() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
        Date.now(),
      ],
    );

    const msg = await cmd.message.fetch().catch(() => {});
    if (!msg) return;

    const disable = new Builders.UnsafeButtonBuilder()
      .setCustomId('vote_reminder_disable')
      .setStyle(Discord.ButtonStyle.Danger)
      .setLabel('Disable Vote Reminder');

    const vote = new Builders.UnsafeButtonBuilder()
      .setStyle(Discord.ButtonStyle.Link)
      .setURL('https://top.gg/bot/650691698409734151/vote')
      .setLabel('Vote for Ayako');

    const embed = new Builders.UnsafeEmbedBuilder(msg.embeds[0]);

    cmd.client.ch.edit(cmd, {
      embeds: [embed],
      components: cmd.client.ch.buttonRower([vote, disable]),
    });
  },
};
