const Builders = require('@discordjs/builders');

module.exports = {
  execute(msg) {
    if (!msg.channel || !msg.author) return;
    if (msg.author.id === msg.client.user.id) return;
    if (msg.channel.type !== 1) return;
    const dmembed = new Builders.UnsafeEmbedBuilder()
      .setColor(msg.client.constants.standard.color)
      .setDescription(`${msg.author} / ${msg.author.id}\n\u200b${msg.content}`)
      .addFields({ name: '\u200b', value: msg.url })
      .setTimestamp();
    for (let i = 0; i < msg.attachments.length; i += 1) {
      dmembed.addFields({ name: '\u200b', value: msg.attachments[i].url });
    }
    for (let i = 0; i < msg.embeds.length; i += 1) {
      let text;
      if (msg.embeds[i].data.title) text = msg.embeds[i].data.title;
      else if (msg.embeds[i].data.author) text = msg.embeds[i].data.author.name;
      else text = 'none';
      dmembed.addFields({ name: '\u200b', value: text });
    }
    msg.client.ch.send(msg.client.channels.cache.get('825297763822469140'), { embeds: [dmembed] });
  },
};
