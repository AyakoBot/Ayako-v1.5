import type Eris from 'eris';
import Builders from '@discordjs/builders';
import Discord from 'discord.js';
import client from '../ErisClient';

export default async (
  msg: Eris.Message,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  const buttons = [
    new Builders.UnsafeButtonBuilder()
      .setCustomId('proceed')
      .setLabel(language.mod.warning.proceed)
      .setStyle(Discord.ButtonStyle.Danger)
      .setEmoji(client.objectEmotes.warning),
    new Builders.UnsafeButtonBuilder()
      .setCustomId('abort')
      .setLabel(language.mod.warning.abort)
      .setStyle(Discord.ButtonStyle.Secondary)
      .setEmoji(client.objectEmotes.cross),
  ];

  const m = await module.exports.reply(msg, {
    content: language.mod.warning.text,
    components: module.exports.buttonRower([buttons]),
    allowedMentions: { repliedUser: true },
  });

  const collector = m.createMessageComponentCollector({ time: 30000 });
  return new Promise((resolve) => {
    collector.on('collect', (answer) => {
      if (answer.user.id !== msg.author.id) module.exports.notYours(answer);
      else if (answer.customId === 'proceed') {
        m.delete().catch(() => {});
        resolve(true);
      } else if (answer.customId === 'abort') {
        m.delete().catch(() => {});
        resolve();
      }
    });
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        resolve();
        m.delete().catch(() => {});
      }
    });
  });
};
