import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default (msg: CT.Message) => {
  if (!msg.channel || !msg.author) return;
  if (msg.author.id === client.user.id) return;
  if (msg.channel.type !== 1) return;
  const embed = {
    type: 'rich',
    color: client.constants.standard.color,
    description: `${msg.author} / ${msg.author.id}\n${msg.content}`,
    fields: [{ name: '\u200b', value: msg.jumpLink }],
  };

  for (let i = 0; i < msg.attachments.length; i += 1) {
    embed.fields.push({ name: '\u200b', value: msg.attachments[i].url });
  }

  for (let i = 0; i < msg.embeds.length; i += 1) {
    const thisEmbed = msg.embeds[i];
    let text = 'none';
    if (thisEmbed.title) text = thisEmbed.title;
    else if (thisEmbed.author) text = thisEmbed.author?.name;

    embed.fields.push({ name: '\u200b', value: text });
  }
  client.ch.send(
    client.guilds.get('669893888856817665')?.channels.get('825297763822469140'),
    {
      embeds: [embed],
    },
    msg.language,
  );
};
