const Builders = require('@discordjs/builders');

module.exports = {
  name: 'question',
  category: 'Fun',
  dm: false,
  takesFirstArg: true,
  aliases: ['ask', 'q', 'qotd'],
  thisGuildOnly: ['298954459172700181'],
  usage: ['question [qotd]'],
  type: 'fun',
  async execute(msg) {
    if (msg.channel.id !== '715136490526474261') return;
    const e = new Builders.UnsafeEmbedBuilder()
      .setTitle('New Question of the Day!')
      .setColor(11599616)
      .setDescription(`**${msg.args.join(' ')}**`)
      .setFooter({
        text: `Asked by ${msg.author.username}`,
        iconURL: 'https://cdn-icons-png.flaticon.com/128/2538/2538036.png',
      });

    await msg.channel.send({ embeds: [e] });
  },
};
