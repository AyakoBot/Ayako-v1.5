const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'vote_reminder_disable',
  split: null,
  execute: async (cmd) => {
    cmd.client.ch.query(
      `INSERT INTO users (userid, votereminders) VALUES ($1, $2)
        ON CONFLICT (userid) DO
        UPDATE SET votereminders = $2;`,
      [cmd.user.id, false],
    );

    const msg = await cmd.message.fetch().catch(() => {});
    if (!msg) return;

    const enable = new Builders.UnsafeButtonBuilder()
      .setCustomId('vote_reminder_enable')
      .setStyle(Discord.ButtonStyle.Primary)
      .setLabel('Enable Vote Reminder');

    const vote = new Builders.UnsafeButtonBuilder()
      .setStyle(Discord.ButtonStyle.Link)
      .setURL('https://top.gg/bot/650691698409734151/vote')
      .setLabel('Vote for Ayako');

    const embed = new Builders.UnsafeEmbedBuilder(msg.embeds[0]);

    cmd.update({
      embeds: [embed],
      components: cmd.client.ch.buttonRower([vote, enable]),
    });
  },
};
