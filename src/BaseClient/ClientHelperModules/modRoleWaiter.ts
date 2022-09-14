import type Eris from 'eris';
import reply from './reply';
import notYours from './notYours';
import buttonRower from './buttonRower';

export default async (
  msg: Eris.Message,
  language: typeof import('../../Languages/en.json'),
) => {
  const { default: client } = await import('../ErisClient');
  const { default: InteractionCollector } = await import('../Other/InteractionCollector');

  const buttons: Eris.Button[] = [
    {
      custom_id: 'proceed',
      label: language.mod.warning.proceed,
      style: 4,
      emoji: client.objectEmotes.warning,
      type: 2,
    },
    {
      custom_id: 'abort',
      label: language.mod.warning.abort,
      style: 2,
      emoji: client.objectEmotes.cross,
      type: 2,
    },
  ];

  const m = await reply(msg, {
    content: language.mod.warning.text,
    components: buttonRower([buttons]),
    allowedMentions: { repliedUser: true },
  });

  if (!m) return false;

  const collector = new InteractionCollector(m, 30000);
  return new Promise((resolve) => {
    collector.on('collect', (answer) => {
      if (answer.user.id !== msg.author.id) notYours(answer, language);
      else if (answer.customId === 'proceed') {
        m.delete().catch(() => null);
        resolve(true);
      } else if (answer.customId === 'abort') {
        m.delete().catch(() => null);
        resolve(false);
      }
    });
    collector.on('end', (reason) => {
      if (reason === 'time') {
        resolve(false);
        m.delete().catch(() => null);
      }
    });
  });
};
