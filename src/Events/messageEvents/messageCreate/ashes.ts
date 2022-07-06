import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message) => {
  if (msg.channel.id === '757879586439823440' && msg.author.id === '646937666251915264') {
    if (msg.content.includes('since this server is currently active')) {
      client.ch.reply(
        msg as Eris.Message,
        {
          content: '<@&893986129773207582> Karuta has dropped Cards! Move or lose.',
          allowedMentions: { roles: ['893986129773207582'] },
        },
        msg.language,
      );
    }

    if (msg.content.includes('A card from your wishlist is dropping')) {
      client.ch.reply(
        msg as Eris.Message,
        {
          content: '<@&893986129773207582> a wished Card was dropped! Move or lose.',
          allowedMentions: { roles: ['893986129773207582'] },
        },
        msg.language,
      );
    }
  }

  if (
    msg.author.id === '868115102681956404' &&
    msg.channel.id === '757879586439823440' &&
    msg.content.includes('@Known-Scammers ping:')
  ) {
    const isUnban = msg.content.includes('REMOVAL FROM LIST');
    const executor = client.ch.getUser('646937666251915264');

    const ids = msg.content.match(/\d{17,19}/gm);
    if (!ids || !ids.length) return;

    ids.forEach((id) => {
      const user = client.ch.getUser(id);
      if (!user) {
        return client.ch.error(msg as Eris.Message, msg.language.errors.userNotFound, msg.language);
      }

      const reasonArgs = msg.content.replace(/```/g, '').split(/:/);
      const reason = reasonArgs[reasonArgs.findIndex((c) => c.includes('Reason')) + 1];

      if (isUnban) {
        client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || client.user,
            reason,
            msg,
            guild: msg.guild,
          },
          'banRemove',
        );
      } else {
        client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || client.user,
            reason,
            msg,
            guild: msg.guild,
          },
          'banAdd',
        );
      }
      return null;
    });
  }
};
