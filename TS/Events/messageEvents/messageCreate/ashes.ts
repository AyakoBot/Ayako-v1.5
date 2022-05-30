import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (msg: Eris.Message) => {
  if (msg.channel.id === '757879586439823440' && msg.author.id === '646937666251915264') {
    if (msg.content.includes('since this server is currently active')) {
      client.ch.reply(msg, {
        content: '<@&893986129773207582> Karuta has dropped Cards! Move or lose.',
      });
    }

    if (msg.content.includes('A card from your wishlist is dropping')) {
      client.ch.reply(msg, {
        content: '<@&893986129773207582> a wished Card was dropped! Move or lose.',
      });
    }
  }

  if (
    msg.author.id === '868115102681956404' &&
    msg.channel.id === '757879586439823440' &&
    msg.content.includes('@Known-Scammers ping:')
  ) {
    const isUnban = msg.content.includes('REMOVAL FROM LIST');
    const executor = await msg.client.users.fetch('646937666251915264').catch(() => {});

    const ids = msg.content.match(/\d{17,19}/gm);

    msg.language = await msg.client.ch.languageSelector(msg.guild);

    ids.forEach(async (id) => {
      const user = await msg.client.users.fetch(id).catch(() => {});
      if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

      const reasonArgs = msg.content.replace(/```/g, '').split(/:/);
      const reason = reasonArgs[reasonArgs.findIndex((c) => c.includes('Reason')) + 1];

      if (isUnban) {
        msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || msg.client.user,
            reason,
            msg,
            guild: msg.guild,
          },
          'banRemove',
        );
      } else {
        msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || msg.client.user,
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
