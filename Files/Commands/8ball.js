const Builders = require('@discordjs/builders');

module.exports = {
  name: '8ball',
  perm: null,
  dm: true,
  takesFirstArg: true,
  type: 'fun',
  async execute(msg) {
    const random = Math.floor(Math.random() * 15);
    const question = msg.args.slice(0).join(' ');
    const answer = msg.lan.answers[random];
    const embed = new Builders.UnsafeEmbedBuilder()
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.members.me : null))
      .setAuthor({
        name: msg.lan.author,
        iconURL: msg.client.constants.standard.image,
        url: msg.client.constants.standard.invite,
      })
      .addFields(
        { name: msg.lan.question, value: `${question}\u200b`, inline: false },
        { name: msg.lan.answer, value: `${answer}\u200b`, inline: false },
      );
    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};
