const Builders = require('@discordjs/builders');

module.exports = {
  name: 'amiin',
  perm: null,
  dm: false,
  takesFirstArg: false,
  category: null,
  usage: ['amiin'],
  thisGuildOnly: ['108176345204264960'],
  type: 'info',
  async execute(msg) {
    if (msg.channel.id === '805839305377447936') return;
    const id = msg.args[0] ? msg.args[0] : msg.author.id;
    const embed = new Builders.UnsafeEmbedBuilder();
    const res = await msg.client.ch.query('SELECT * FROM stats;');
    if (res.rows[0].willis == null) {
      embed
        .setDescription(
          `${msg.client.textEmotes.tick} You are NOT participating!\nGo to <#979811225212956722> and follow the instructions to enter`,
        )
        .setColor(16776960);
    } else if (res.rows[0].willis.includes(id)) {
      embed
        .setDescription(`${msg.client.textEmotes.tick} You are participating! Good Luck!`)
        .setColor(65280);
    } else {
      embed
        .setDescription(
          `${msg.client.textEmotes.tick} You are NOT participating!\nGo to <#979811225212956722> and follow the instructions to enter`,
        )
        .setColor(16711680);
    }
    msg.channel.send({ embeds: [embed] });
  },
};
