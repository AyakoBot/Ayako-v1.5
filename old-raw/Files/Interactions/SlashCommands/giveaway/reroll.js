const Builders = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = async (cmd) => {
  const options = cmd.options._hoistedOptions;
  const msgid = options.find((o) => o.name === 'giveaway').value;

  const res = await cmd.client.ch.query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid]);
  if (!res || !res.rowCount) return;

  const giveaway = res.rows[0];
  const lan = cmd.language.slashCommands.giveaway.reroll;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(cmd.client.constants.colors.success)
    .setDescription(lan.rerolled);

  cmd.client.ch.reply(cmd, {
    embeds: [embed],
    ephemeral: true,
    components: cmd.client.ch.buttonRower([
      [
        new Builders.UnsafeButtonBuilder()
          .setURL(
            cmd.client.ch.stp(cmd.client.constants.standard.discordUrlDB, {
              guildid: giveaway.guildid,
              channelid: giveaway.channelid,
              messageid: giveaway.msgid,
            }),
          )
          .setLabel(lan.button)
          .setStyle(Discord.ButtonStyle.Link),
      ],
    ]),
  });

  require('./end').end(giveaway, true);
};
